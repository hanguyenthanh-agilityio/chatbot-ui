import { afterEach, describe, expect, it, vi } from "vitest";

import { OPENAI_VALIDATION_API_COPY } from "@/constants/api";
import { validateOpenAIApiKey } from "@/lib/openai-key-validation";

describe("validateOpenAIApiKey", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns valid when OpenAI responds with ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => "",
      }),
    );

    const result = await validateOpenAIApiKey("sk-test");
    expect(result.ok).toBe(true);
    expect(result.message).toBe(OPENAI_VALIDATION_API_COPY.valid);
  });

  it("returns invalid with API error message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        text: async () =>
          JSON.stringify({
            error: { message: "Country, region, or territory not supported" },
          }),
      }),
    );

    const result = await validateOpenAIApiKey("sk-test");
    expect(result.ok).toBe(false);
    expect(result.details).toContain("not supported");
  });
});
