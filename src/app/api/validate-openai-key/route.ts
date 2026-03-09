import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { getErrorMessage } from "@/utils/error-message";

type ValidateKeyRequestBody = {
  apiKey?: string;
};

function badRequest(message: string) {
  return Response.json({ ok: false, message }, { status: 400 });
}

export async function POST(req: Request) {
  let body: ValidateKeyRequestBody;
  try {
    body = (await req.json()) as ValidateKeyRequestBody;
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const apiKey = body.apiKey?.trim();
  if (!apiKey) {
    return badRequest("`apiKey` is required.");
  }

  try {
    const openai = createOpenAI({
      apiKey,
      baseURL: "https://api.openai.com/v1",
    });

    await generateText({
      model: openai.chat("gpt-4o-mini"),
      prompt: "hello",
    });

    return Response.json({
      ok: true,
      message: "OpenAI key is valid.",
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message: "OpenAI key can't use.",
        details: getErrorMessage(error),
      },
      { status: 400 },
    );
  }
}
