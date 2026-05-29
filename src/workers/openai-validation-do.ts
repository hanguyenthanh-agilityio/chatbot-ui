import { API_COMMON_ERROR_COPY } from "../constants/api";
import { validateOpenAIApiKey } from "../lib/openai-key-validation";

/** Runs OpenAI key checks from a US Durable Object (see `locationHint: wnam`). */
export class OpenAIValidationDO {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    let apiKey = "";
    try {
      const body = (await request.json()) as { apiKey?: string };
      apiKey = body.apiKey?.trim() ?? "";
    } catch {
      return Response.json(
        { ok: false, message: API_COMMON_ERROR_COPY.invalidJsonBody },
        { status: 400 },
      );
    }

    const result = await validateOpenAIApiKey(apiKey);
    return Response.json(result, { status: result.ok ? 200 : 400 });
  }
}
