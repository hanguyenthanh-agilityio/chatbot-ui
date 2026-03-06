import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";
import {
  DEFAULT_CHAT_FEATURE_MODE,
  isChatFeatureMode,
  type ChatFeatureMode,
} from "@/constants/ai-feature";
import {
  AIProviderName,
  getChatModelConfig,
  getSupportedAIProviderList,
  isAIProviderName,
} from "@/lib/ai-provider";
import {
  hasImageFileAttachment,
  normalizeMessagesForFileAttachments,
} from "@/lib/chat-attachment";
import {
  FEATURE_SYSTEM_PROMPTS,
  getToolsForMode,
} from "@/lib/chat/feature-config";
import { normalizeMcpServerUrl } from "@/lib/mcp-url";
import { resolveOllamaVisionModel } from "@/lib/chat/ollama-vision";
import { normalizeOllamaBaseUrl } from "@/lib/ollama-url";
import {
  formatStreamError,
  resolveProviderCandidate,
  streamWithMcpTools,
  streamWithMultiAgentPipeline,
} from "@/lib/chat/pipelines";
import { isProductionLikeServer } from "@/lib/runtime-env";
import { getErrorMessage } from "@/utils/error-message";

export const maxDuration = 60;
export const runtime = "nodejs";

type ChatRequestBody = {
  messages?: UIMessage[];
  provider?: string;
  openaiApiKey?: string;
  ollamaBaseUrl?: string;
  mcpServerUrl?: string;
  featureMode?: string;
};

function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

function parseProviderOverride(provider?: string): {
  providerOverride?: AIProviderName;
  errorMessage?: string;
} {
  const providerFromBody = provider?.trim().toLowerCase();

  if (!providerFromBody) {
    return {};
  }

  if (!isAIProviderName(providerFromBody)) {
    return {
      errorMessage: `Invalid \`provider\`. Supported values: ${getSupportedAIProviderList()}.`,
    };
  }

  return { providerOverride: providerFromBody };
}

function parseFeatureMode(featureMode?: string): {
  featureMode?: ChatFeatureMode;
  errorMessage?: string;
} {
  const featureModeRaw =
    featureMode?.trim().toLowerCase() ?? DEFAULT_CHAT_FEATURE_MODE;
  // Backward compatibility for older payloads.
  const normalizedFeatureMode =
    featureModeRaw === "multi-tool" ? "agent" : featureModeRaw;

  if (!isChatFeatureMode(normalizedFeatureMode)) {
    return { errorMessage: `Invalid \`featureMode\`: ${featureModeRaw}.` };
  }

  return { featureMode: normalizedFeatureMode };
}

function deriveOllamaTagsEndpoint(baseUrl?: string): string | undefined {
  if (!baseUrl?.trim()) return undefined;

  try {
    return new URL("/api/tags", baseUrl).toString();
  } catch {
    return undefined;
  }
}

function validateRuntimeConstraints({
  provider,
  featureMode,
  ollamaBaseUrl,
  mcpServerUrl,
}: {
  provider: AIProviderName;
  featureMode: ChatFeatureMode;
  ollamaBaseUrl?: string;
  mcpServerUrl?: string;
}): string | undefined {
  if (provider === "openai" && featureMode === "mcp") {
    return "`mcp` mode is disabled for OpenAI provider. Switch to Ollama provider.";
  }

  if (!isProductionLikeServer() || provider !== "ollama") {
    return undefined;
  }

  if (!ollamaBaseUrl?.trim()) {
    return "Production Ollama requires `ollamaBaseUrl` (public tunnel URL).";
  }

  if (featureMode === "mcp" && !mcpServerUrl?.trim()) {
    return "MCP mode with Ollama requires `mcpServerUrl` (public MCP URL).";
  }

  return undefined;
}

export async function POST(req: Request) {
  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return badRequest("Invalid JSON body.");
  }

  if (!Array.isArray(body.messages)) {
    return badRequest("`messages` must be an array.");
  }

  const { providerOverride, errorMessage: providerErrorMessage } =
    parseProviderOverride(body.provider);
  if (providerErrorMessage) {
    return badRequest(providerErrorMessage);
  }

  const { featureMode, errorMessage: featureModeErrorMessage } =
    parseFeatureMode(body.featureMode);
  if (featureModeErrorMessage || !featureMode) {
    return badRequest(featureModeErrorMessage ?? "Invalid `featureMode`.");
  }

  const providerCandidate = resolveProviderCandidate(providerOverride);
  const runtimeConstraintError = validateRuntimeConstraints({
    provider: providerCandidate,
    featureMode,
    ollamaBaseUrl: body.ollamaBaseUrl,
    mcpServerUrl: body.mcpServerUrl,
  });
  if (runtimeConstraintError) {
    return badRequest(runtimeConstraintError);
  }

  const hasImageAttachment = hasImageFileAttachment(body.messages);
  const ollamaBaseUrlOverride =
    normalizeOllamaBaseUrl(body.ollamaBaseUrl) ?? undefined;
  const ollamaTagsEndpointOverride = deriveOllamaTagsEndpoint(
    ollamaBaseUrlOverride,
  );
  let modelIdOverride: string | undefined;

  if (providerCandidate === "ollama" && hasImageAttachment) {
    const resolvedVisionModel = await resolveOllamaVisionModel({
      tagsEndpointOverride: ollamaTagsEndpointOverride,
    });
    if ("errorMessage" in resolvedVisionModel) {
      return badRequest(resolvedVisionModel.errorMessage);
    }

    modelIdOverride = resolvedVisionModel.modelId;
  }

  let modelConfig: ReturnType<typeof getChatModelConfig>;
  try {
    modelConfig = getChatModelConfig({
      provider: providerOverride,
      openaiApiKey: body.openaiApiKey,
      modelId: modelIdOverride,
      baseUrl:
        providerCandidate === "ollama" ? ollamaBaseUrlOverride : undefined,
    });
  } catch (error) {
    return Response.json({ error: getErrorMessage(error) }, { status: 500 });
  }

  const normalizedMessages = await normalizeMessagesForFileAttachments(
    body.messages,
  );
  const modelMessages = await convertToModelMessages(normalizedMessages);

  if (featureMode === "mcp") {
    return streamWithMcpTools({
      model: modelConfig.model,
      provider: modelConfig.provider,
      messages: modelMessages,
      mcpServerUrlOverride:
        normalizeMcpServerUrl(body.mcpServerUrl) ?? undefined,
    });
  }

  if (featureMode === "multi-agent") {
    return streamWithMultiAgentPipeline({
      model: modelConfig.model,
      provider: modelConfig.provider,
      messages: modelMessages,
    });
  }

  const result = streamText({
    model: modelConfig.model,
    system: FEATURE_SYSTEM_PROMPTS[featureMode],
    messages: modelMessages,
    tools: getToolsForMode(featureMode),
    // Enable multi-step loops only for tool-based modes.
    stopWhen:
      featureMode === "tool" || featureMode === "agent"
        ? stepCountIs(8)
        : undefined,
    temperature: featureMode === "prompt" ? 0 : undefined,
  });

  return result.toUIMessageStreamResponse({
    onError: (error) => formatStreamError(error, modelConfig.provider),
  });
}
