import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import {
  API_COMMON_ERROR_COPY,
  OPENAI_VALIDATION_API_COPY,
} from "@/constants/api";
import type { OpenAIKeyValidationRequestBody } from "@/types/api";
import { getErrorMessage } from "@/utils/error";

declare global {
  interface CloudflareEnv {
    OPENAI_VALIDATION?: DurableObjectNamespace;
  }
}

const DO_VALIDATION_ID = "openai-validation";
const DO_LOCATION_HINT = "wnam";

function badRequest(message: string) {
  return Response.json({ ok: false, message }, { status: 400 });
}

async function validateDirect(apiKey: string) {
  const openai = createOpenAI({
    apiKey,
    baseURL: OPENAI_VALIDATION_API_COPY.baseUrl,
  });

  await generateText({
    model: openai.chat(process.env.OPENAI_MODEL ?? OPENAI_VALIDATION_API_COPY.testModel),
    prompt: OPENAI_VALIDATION_API_COPY.testPrompt,
  });

  return Response.json({
    ok: true,
    message: OPENAI_VALIDATION_API_COPY.valid,
  });
}

async function validateViaDurableObject(apiKey: string) {
  const { env } = await getCloudflareContext({ async: true });
  const namespace = env.OPENAI_VALIDATION;
  if (!namespace) {
    return validateDirect(apiKey);
  }

  const stub = namespace.get(namespace.idFromName(DO_VALIDATION_ID), {
    locationHint: DO_LOCATION_HINT,
  });

  const response = await stub.fetch(
    new Request("https://openai-validation.internal/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey,
        model: process.env.OPENAI_MODEL ?? OPENAI_VALIDATION_API_COPY.testModel,
      }),
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
    return await validateDirect(apiKey);
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message: OPENAI_VALIDATION_API_COPY.invalid,
        details: getErrorMessage(error),
      },
      { status: 400 },
    );
  }
}
