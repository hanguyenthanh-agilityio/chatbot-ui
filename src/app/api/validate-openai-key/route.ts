import { getCloudflareContext } from "@opennextjs/cloudflare";

import {
  API_COMMON_ERROR_COPY,
  OPENAI_VALIDATION_API_COPY,
} from "@/constants/api";
import { validateOpenAIApiKey } from "@/lib/openai-key-validation";
import type { OpenAIKeyValidationRequestBody } from "@/types/api";

const OPENAI_VALIDATION_DO_NAME = "openai-key-validation";
const OPENAI_VALIDATION_DO_LOCATION = "wnam" as const;

function badRequest(message: string, details?: string) {
  return Response.json({ ok: false, message, details }, { status: 400 });
}

async function validateViaDurableObject(
  apiKey: string,
): Promise<Response | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const namespace = env.OPENAI_VALIDATION;
    if (!namespace) {
      return null;
    }

    const id = namespace.idFromName(OPENAI_VALIDATION_DO_NAME);
    const stub = namespace.get(id, {
      locationHint: OPENAI_VALIDATION_DO_LOCATION,
    });

    return stub.fetch(
      new Request("https://openai-validation.internal/validate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ apiKey }),
      }),
    );
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  let body: OpenAIKeyValidationRequestBody;
  try {
    body = (await req.json()) as OpenAIKeyValidationRequestBody;
  } catch {
    return badRequest(API_COMMON_ERROR_COPY.invalidJsonBody);
  }

  const apiKey = body.apiKey?.trim();
  if (!apiKey) {
    return badRequest(OPENAI_VALIDATION_API_COPY.missingApiKey);
  }

  const viaDo = await validateViaDurableObject(apiKey);
  if (viaDo) {
    return viaDo;
  }

  const result = await validateOpenAIApiKey(apiKey);
  return Response.json(result, { status: result.ok ? 200 : 400 });
}
