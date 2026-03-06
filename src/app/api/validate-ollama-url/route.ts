import { getErrorMessage } from "@/utils/error-message";

type ValidateOllamaUrlRequestBody = {
  baseUrl?: string;
};

function badRequest(message: string) {
  return Response.json({ ok: false, message }, { status: 400 });
}

function parseAndValidateBaseUrl(rawUrl?: string): URL | null {
  const trimmed = rawUrl?.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    if (!["http:", "https:"].includes(url.protocol)) {
      return null;
    }

    const normalizedPath = url.pathname.replace(/\/+$/, "");
    if (normalizedPath !== "/v1") {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  let body: ValidateOllamaUrlRequestBody;

  try {
    body = (await req.json()) as ValidateOllamaUrlRequestBody;
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const baseUrl = parseAndValidateBaseUrl(body.baseUrl);
  if (!baseUrl) {
    return badRequest(
      "`baseUrl` must be a valid http/https URL and end with `/v1`.",
    );
  }

  try {
    const tagsUrl = new URL("/api/tags", baseUrl).toString();
    const response = await fetch(tagsUrl, {
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });

    if (!response.ok) {
      return badRequest(
        `Ollama tags endpoint returned ${response.status}. Check tunnel URL and /v1 suffix.`,
      );
    }

    const data = (await response.json()) as {
      models?: Array<{ name?: string; model?: string }>;
    };

    const modelCount = Array.isArray(data.models) ? data.models.length : 0;

    return Response.json({
      ok: true,
      message: "Ollama URL verified.",
      details:
        modelCount > 0
          ? `Connected successfully. Detected ${modelCount} model(s).`
          : "Connected successfully. No models were listed.",
    });
  } catch (error) {
    return badRequest(`Cannot connect to Ollama URL: ${getErrorMessage(error)}`);
  }
}
