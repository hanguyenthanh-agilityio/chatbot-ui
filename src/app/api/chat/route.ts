import { convertToModelMessages, streamText, UIMessage } from "ai";
import {
  AIProviderName,
  getChatModelConfig,
  getSupportedAIProviderList,
  isAIProviderName,
} from "@/lib/ai-provider";
import { getErrorMessage } from "@/utils/error-message";

const SYSTEM_PROMPT = "You are a helpful assistant.";

type ChatRequestBody = {
  messages?: UIMessage[];
  provider?: string;
  openaiApiKey?: string;
};

function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

function formatStreamError(error: unknown, provider: AIProviderName): string {
  const message = getErrorMessage(error);
  const normalizedMessage = message.toLowerCase();

  if (
    provider === "openai" &&
    normalizedMessage.includes("insufficient_quota")
  ) {
    return "OpenAI quota exceeded. Use local free mode by setting OPENAI_BASE_URL=http://localhost:11434/v1 and OPENAI_MODEL=qwen2.5:3b.";
  }

  if (
    provider === "ollama" &&
    (normalizedMessage.includes("econnrefused") ||
      normalizedMessage.includes("fetch failed") ||
      normalizedMessage.includes("connection"))
  ) {
    return "Cannot connect to Ollama at http://localhost:11434. Start Ollama and run `ollama pull qwen2.5:3b`.";
  }

  return message;
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

  const providerFromBody = body.provider?.trim().toLowerCase();
  let providerOverride: AIProviderName | undefined;
  if (providerFromBody) {
    if (!isAIProviderName(providerFromBody)) {
      return badRequest(
        `Invalid \`provider\`. Supported values: ${getSupportedAIProviderList()}.`,
      );
    }

    providerOverride = providerFromBody;
  }

  let modelConfig: ReturnType<typeof getChatModelConfig>;
  try {
    modelConfig = getChatModelConfig({
      provider: providerOverride,
      openaiApiKey: body.openaiApiKey,
    });
  } catch (error) {
    return Response.json({ error: getErrorMessage(error) }, { status: 500 });
  }

  const result = streamText({
    model: modelConfig.model,
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(body.messages),
  });

  return result.toUIMessageStreamResponse({
    onError: (error) => formatStreamError(error, modelConfig.provider),
  });
}
