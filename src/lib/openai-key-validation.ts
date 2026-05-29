import { OPENAI_VALIDATION_API_COPY } from "@/constants/api";
import { getErrorMessage } from "@/utils/error";

export type OpenAIKeyValidationResult = {
  ok: boolean;
  message: string;
  details?: string;
};

function resolveOpenAIBaseUrl(baseUrl?: string) {
  const raw =
    baseUrl?.trim() ||
    process.env.OPENAI_BASE_URL?.trim() ||
    OPENAI_VALIDATION_API_COPY.baseUrl;
  return raw.replace(/\/$/, "");
}

/** Lightweight key check — `GET /v1/models` (no chat completion). */
export async function validateOpenAIApiKey(
  apiKey: string,
  options?: { baseUrl?: string },
): Promise<OpenAIKeyValidationResult> {
  const trimmed = apiKey.trim();
  if (!trimmed) {
    return { ok: false, message: OPENAI_VALIDATION_API_COPY.missingApiKey };
  }

  try {
    const response = await fetch(`${resolveOpenAIBaseUrl(options?.baseUrl)}/models`, {
      method: "GET",
      headers: { Authorization: `Bearer ${trimmed}` },
    });

    if (response.ok) {
      return { ok: true, message: OPENAI_VALIDATION_API_COPY.valid };
    }

    let details = await response.text();
    try {
      const json = JSON.parse(details) as { error?: { message?: string } };
      details = json.error?.message ?? details;
    } catch {
      // keep raw body
    }

    return {
      ok: false,
      message: OPENAI_VALIDATION_API_COPY.invalid,
      details: details || `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      ok: false,
      message: OPENAI_VALIDATION_API_COPY.invalid,
      details: getErrorMessage(error),
    };
  }
}
