import { createOpenAI } from "@ai-sdk/openai";
import { generateImage } from "ai";
import { isAIProviderName, type AIProviderName } from "@/lib/ai-provider";
import { getErrorMessage } from "@/utils/error-message";

type ImageGenerationRequestBody = {
  prompt?: string;
  provider?: string;
  openaiApiKey?: string;
};

function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

function resolveOpenAIApiKey(override?: string): string | null {
  const keyFromBody = override?.trim();
  if (keyFromBody) return keyFromBody;

  const keyFromEnv = process.env.OPENAI_API_KEY?.trim();
  if (keyFromEnv) return keyFromEnv;

  return null;
}

function resolveProvider(value?: string): AIProviderName {
  const normalized = value?.trim().toLowerCase();

  if (!normalized) {
    return "openai";
  }

  if (!isAIProviderName(normalized)) {
    throw new Error(`Unsupported provider: ${normalized}`);
  }

  return normalized;
}

export async function POST(req: Request) {
  let body: ImageGenerationRequestBody;

  try {
    body = (await req.json()) as ImageGenerationRequestBody;
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const prompt = body.prompt?.trim();
  if (!prompt) {
    return badRequest("`prompt` is required.");
  }

  let provider: AIProviderName;
  try {
    provider = resolveProvider(body.provider);
  } catch (error) {
    return badRequest(getErrorMessage(error));
  }

  // Check requested provider capability before issuing model calls.
  if (provider === "ollama") {
    return badRequest(
      "Image generation does not work with Ollama provider in this project. Please switch provider to OpenAI.",
    );
  }

  const apiKey = resolveOpenAIApiKey(body.openaiApiKey);
  if (!apiKey) {
    return badRequest("OpenAI API key is required for image generation.");
  }

  try {
    const openai = createOpenAI({
      apiKey,
      baseURL: "https://api.openai.com/v1",
    });

    const result = await generateImage({
      model: openai.image(process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1"),
      prompt,
      size: "1024x1024",
    });

    return Response.json({
      mediaType: result.image.mediaType,
      base64: result.image.base64,
      warnings: result.warnings,
    });
  } catch (error) {
    return Response.json(
      {
        error: `Image generation failed: ${getErrorMessage(error)}`,
      },
      { status: 500 },
    );
  }
}
