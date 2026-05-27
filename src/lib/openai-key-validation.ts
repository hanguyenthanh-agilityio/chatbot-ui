import { OPENAI_VALIDATION_API_COPY } from "@/constants/api";

export type OpenAIKeyValidationResult = {
  ok: boolean;
  message: string;
  details?: string;
};

function resolveBaseUrl() {
  const configured = process.env.OPENAI_BASE_URL?.trim();
  if (!configured) return OPENAI_VALIDATION_API_COPY.baseUrl;
  return configured.endsWith("/") ? configured : `${configured}/`;
}

/** Lightweight check — GET /models (no chat completion). */
export async function validateOpenAIKey(
  apiKey: string,
): Promise<OpenAIKeyValidationResult> {
  const key = apiKey.trim();
  if (!key) {
    return { ok: false, message: OPENAI_VALIDATION_API_COPY.missingApiKey };
  }

  try {
    const response = await fetch(new URL("models", resolveBaseUrl()), {
      method: "GET",
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
    });

    if (response.status === 401) {
      return {
        ok: false,
        message: OPENAI_VALIDATION_API_COPY.invalid,
        details: "Unauthorized — check the API key.",
      };
    }

    if (!response.ok) {
      const details = (await response.text()).trim() || response.statusText;
      return {
        ok: false,
        message: OPENAI_VALIDATION_API_COPY.invalid,
        details,
      };
    }

    return { ok: true, message: OPENAI_VALIDATION_API_COPY.valid };
  } catch (error) {
    const details =
      error instanceof Error ? error.message : "OpenAI validation failed.";
    return {
      ok: false,
      message: OPENAI_VALIDATION_API_COPY.invalid,
      details,
    };
  }
}
