import { createMCPClient } from "@ai-sdk/mcp";
import { normalizeMcpServerUrl } from "@/lib/mcp-url";
import { getErrorMessage } from "@/utils/error-message";

type ValidateMcpUrlRequestBody = {
  serverUrl?: string;
};

function badRequest(message: string) {
  return Response.json({ ok: false, message }, { status: 400 });
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error("MCP verification timed out."));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export async function POST(req: Request) {
  let body: ValidateMcpUrlRequestBody;

  try {
    body = (await req.json()) as ValidateMcpUrlRequestBody;
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const serverUrl = normalizeMcpServerUrl(body.serverUrl);
  if (!serverUrl) {
    return badRequest("`serverUrl` must be a valid http/https URL.");
  }

  const mcpAuthToken = process.env.MCP_AUTH_TOKEN?.trim();
  let mcpClient: Awaited<ReturnType<typeof createMCPClient>> | undefined;

  try {
    mcpClient = await withTimeout(
      createMCPClient({
        transport: {
          type: "http",
          url: serverUrl,
          headers: mcpAuthToken
            ? { Authorization: `Bearer ${mcpAuthToken}` }
            : undefined,
        },
      }),
      8_000,
    );

    const mcpTools = await withTimeout(mcpClient.tools(), 8_000);
    const toolNames = Object.keys(mcpTools);

    return Response.json({
      ok: true,
      message: "MCP URL verified.",
      normalizedServerUrl: serverUrl,
      details:
        toolNames.length > 0
          ? `Connected successfully. Discovered tools: ${toolNames.join(", ")}`
          : "Connected successfully. No tools were discovered.",
    });
  } catch (error) {
    return badRequest(`Cannot connect to MCP URL: ${getErrorMessage(error)}`);
  } finally {
    await mcpClient?.close();
  }
}
