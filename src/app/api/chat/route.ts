import {
  type UIMessage,
} from "ai";
import { routeConversation } from "@/agents/coordinator/router";
import { createStaticAgentResponse } from "@/agents/shared/response";
import { runManagerAgent } from "@/agents/manager/run";
import { runTimeOffAgent } from "@/agents/time-off/run";
import { isAppRole } from "@/lib/auth/session";
import { getMockAuthSession } from "@/lib/auth/session-store";
import {
  getChatModelConfig,
  getSupportedAIProviderList,
  isAIProviderName,
  type AIProviderName,
} from "@/lib/ai-provider";
import { normalizeOllamaBaseUrl } from "@/lib/ollama-url";
import { getErrorMessage } from "@/utils/error-message";

export const maxDuration = 60;
export const runtime = "nodejs";

type ChatRequestBody = {
  messages?: UIMessage[];
  provider?: string;
  openaiApiKey?: string;
  ollamaBaseUrl?: string;
  authRole?: string;
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

  const { providerOverride, errorMessage } = parseProviderOverride(body.provider);
  if (errorMessage) {
    return badRequest(errorMessage);
  }

  const authRole = body.authRole?.trim().toLowerCase();
  const session = await getMockAuthSession(
    authRole && isAppRole(authRole) ? authRole : "user",
  );

  const normalizedOllamaBaseUrl = normalizeOllamaBaseUrl(body.ollamaBaseUrl);

  let modelConfig: ReturnType<typeof getChatModelConfig>;
  try {
    modelConfig = getChatModelConfig({
      provider: providerOverride,
      openaiApiKey: body.openaiApiKey,
      baseUrl: providerOverride === "ollama" ? normalizedOllamaBaseUrl ?? undefined : undefined,
    });
  } catch (error) {
    return Response.json({ error: getErrorMessage(error) }, { status: 500 });
  }

  const coordinatorDecision = routeConversation({
    messages: body.messages,
    session,
  });

  if (coordinatorDecision.type === "deny") {
    return createStaticAgentResponse({
      text: coordinatorDecision.message,
      agent: "coordinator",
      accessRole: session.role,
      originalMessages: body.messages,
    });
  }

  switch (coordinatorDecision.specialist) {
    case "manager":
      return runManagerAgent({
        model: modelConfig.model,
        messages: body.messages,
        session,
      });
    case "time-off":
      return runTimeOffAgent({
        model: modelConfig.model,
        messages: body.messages,
        session,
      });
  }
}
