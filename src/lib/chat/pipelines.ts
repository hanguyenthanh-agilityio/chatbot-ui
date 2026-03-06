import { createMCPClient, type MCPClient } from "@ai-sdk/mcp";
import { Experimental_StdioMCPTransport } from "@ai-sdk/mcp/mcp-stdio";
import {
  generateText,
  stepCountIs,
  streamText,
  type LanguageModel,
  type ModelMessage,
  type ToolSet,
} from "ai";
import {
  AIProviderName,
  isAIProviderName,
} from "@/lib/ai-provider";
import {
  FEATURE_SYSTEM_PROMPTS,
  getMultiAgentResearchToolSet,
} from "@/lib/chat/feature-config";
import { getErrorMessage } from "@/utils/error-message";

const DEFAULT_MCP_STDIO_SERVER_PATH = "scripts/mcp-demo-server.mjs";

export function formatStreamError(
  error: unknown,
  provider: AIProviderName,
): string {
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

  if (
    provider === "ollama" &&
    normalizedMessage.includes("model") &&
    normalizedMessage.includes("not found")
  ) {
    return "Requested Ollama model was not found locally. Pull it first (e.g. `ollama pull gemma3:4b` for vision).";
  }

  return message;
}

export function resolveProviderCandidate(
  providerOverride?: AIProviderName,
): AIProviderName {
  if (providerOverride) {
    return providerOverride;
  }

  const envProvider = process.env.AI_PROVIDER?.trim().toLowerCase();

  if (envProvider && isAIProviderName(envProvider)) {
    return envProvider;
  }

  return "ollama";
}

export async function streamWithMcpTools({
  model,
  provider,
  messages,
}: {
  model: LanguageModel;
  provider: AIProviderName;
  messages: ModelMessage[];
}): Promise<Response> {
  const mcpUrl = process.env.MCP_SERVER_URL?.trim();
  const mcpAuthToken = process.env.MCP_AUTH_TOKEN?.trim();
  const mcpStdioServerPath =
    process.env.MCP_STDIO_SERVER_PATH ?? DEFAULT_MCP_STDIO_SERVER_PATH;
  const mcpTransport = mcpUrl
    ? {
        type: "http" as const,
        url: mcpUrl,
        headers: mcpAuthToken
          ? { Authorization: `Bearer ${mcpAuthToken}` }
          : undefined,
      }
    : new Experimental_StdioMCPTransport({
        command: process.env.MCP_STDIO_COMMAND?.trim() || "node",
        args: [mcpStdioServerPath],
        cwd: process.cwd(),
      });

  let mcpClient: MCPClient | undefined;

  try {
    mcpClient = await createMCPClient({
      transport: mcpTransport,
    });

    const mcpTools = (await mcpClient.tools()) as ToolSet;

    const result = streamText({
      model,
      system: FEATURE_SYSTEM_PROMPTS.mcp,
      messages,
      tools: mcpTools,
      stopWhen: stepCountIs(8),
      temperature: 0,
      onFinish: async () => {
        await mcpClient?.close();
      },
    });

    return result.toUIMessageStreamResponse({
      onError: (error) => formatStreamError(error, provider),
    });
  } catch (error) {
    await mcpClient?.close();

    return Response.json(
      {
        error: `MCP integration failed: ${getErrorMessage(error)}${
          mcpUrl
            ? ""
            : ` (Demo stdio server: ${mcpStdioServerPath}; set MCP_SERVER_URL for remote MCP.)`
        }`,
      },
      { status: 500 },
    );
  }
}

export async function streamWithMultiAgentPipeline({
  model,
  provider,
  messages,
}: {
  model: LanguageModel;
  provider: AIProviderName;
  messages: ModelMessage[];
}): Promise<Response> {
  try {
    const planner = await generateText({
      model,
      messages,
      system: `You are Planner Agent.
- Analyze the user's goal and constraints.
- Produce a concise execution plan in bullet points.
- If critical constraints are missing, note them briefly.`,
      temperature: 0,
    });

    const researcher = await generateText({
      model,
      messages,
      system: `You are Research Agent.
- Use available tools when they add concrete facts.
- Use the planner notes as guidance.
- Return only actionable findings.

Planner notes:
${planner.text}`,
      tools: getMultiAgentResearchToolSet(),
      stopWhen: stepCountIs(8),
      temperature: 0,
    });

    const writer = streamText({
      model,
      messages,
      system: `You are Writer Agent.
- Synthesize planner + researcher notes into one final answer.
- Keep answer concise, practical, and structured markdown.
- If uncertainty remains, explicitly list assumptions.

Planner notes:
${planner.text}

Research notes:
${researcher.text}`,
      temperature: 0,
    });

    return writer.toUIMessageStreamResponse({
      onError: (error) => formatStreamError(error, provider),
    });
  } catch (error) {
    return Response.json(
      {
        error: `Multi-agent pipeline failed: ${getErrorMessage(error)}`,
      },
      { status: 500 },
    );
  }
}
