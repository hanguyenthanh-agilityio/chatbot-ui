import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, UIMessage } from "ai";

const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL;
const USES_OLLAMA =
  OPENAI_BASE_URL?.includes("localhost:11434") ||
  OPENAI_BASE_URL?.includes("127.0.0.1:11434");

const MODEL_ID =
  process.env.OPENAI_MODEL ?? (USES_OLLAMA ? "qwen2.5:3b" : "gpt-4o-mini");
const OPENAI_PROVIDER = createOpenAI({
  baseURL: OPENAI_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY,
});
const MODEL = USES_OLLAMA
  ? OPENAI_PROVIDER.chat(MODEL_ID)
  : OPENAI_PROVIDER(MODEL_ID);
const SYSTEM_PROMPT = "You are a helpful assistant.";

type ChatRequestBody = {
  messages?: UIMessage[];
};

function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }

  return "An unknown error occurred.";
}

function formatStreamError(error: unknown): string {
  const message = getErrorMessage(error);
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("insufficient_quota")) {
    return "OpenAI quota exceeded. Use local free mode by setting OPENAI_BASE_URL=http://localhost:11434/v1 and OPENAI_MODEL=qwen2.5:3b.";
  }

  if (
    USES_OLLAMA &&
    (normalizedMessage.includes("econnrefused") ||
      normalizedMessage.includes("fetch failed") ||
      normalizedMessage.includes("connection"))
  ) {
    return "Cannot connect to Ollama at http://localhost:11434. Start Ollama and run `ollama pull qwen2.5:3b`.";
  }

  return message;
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

  const result = streamText({
    model: MODEL,
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(body.messages),
  });

  return result.toUIMessageStreamResponse({
    onError: formatStreamError,
  });
}
