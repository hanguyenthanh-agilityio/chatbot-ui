import { getCloudflareContext } from "@opennextjs/cloudflare";

import {
  API_COMMON_ERROR_COPY,
  OPENAI_VALIDATION_API_COPY,
} from "@/constants/api";
import { validateOpenAIKey } from "@/lib/openai-key-validation";
import type { OpenAIKeyValidationRequestBody } from "@/types/api";
import { getErrorMessage } from "@/utils/error";

type OpenAIValidationNamespace = {
  idFromName(name: string): unknown;
  get(
    id: unknown,
    options?: { locationHint?: string },
  ): { fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> };
};

declare global {
  interface CloudflareEnv {
    OPENAI_VALIDATION?: OpenAIValidationNamespace;
  }
}

const DO_VALIDATION_ID = "openai-validation";
const DO_LOCATION_HINT = "wnam";

function badRequest(message: string, details?: string) {
  return Response.json({ ok: false, message, details }, { status: 400 });
}

async function validateViaDurableObject(apiKey: string) {
  const { env } = await getCloudflareContext({ async: true });
  const namespace = env.OPENAI_VALIDATION;
  if (!namespace) {
    const result = await validateOpenAIKey(apiKey);
    return Response.json(result, { status: result.ok ? 200 : 400 });
  }

  const stub = namespace.get(namespace.idFromName(DO_VALIDATION_ID), {
    locationHint: DO_LOCATION_HINT,
  });

  const response = await stub.fetch(
    new Request("https://openai-validation.internal/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey }),
    }),
  );

  const data = (await response.json()) as {
    ok: boolean;
    message: string;
    details?: string;
  };

  return Response.json(data, { status: response.status });
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

  try {
    const { env } = await getCloudflareContext({ async: true });
    if (env.OPENAI_VALIDATION) {
      return validateViaDurableObject(apiKey);
    }
  } catch {
    // next dev without Cloudflare DO binding
  }

  try {
    const result = await validateOpenAIKey(apiKey);
    return Response.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    return badRequest(OPENAI_VALIDATION_API_COPY.invalid, getErrorMessage(error));
  }
}
