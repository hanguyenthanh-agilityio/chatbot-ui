import { describe, expect, it } from "vitest";
import { ERROR_COPY } from "@/constants/error";
import {
  getDisplayErrorMessage,
  getErrorMessage,
  normalizeErrorMessage,
} from "@/utils/error";

const FALLBACK = "Custom fallback";

describe("error utils", () => {
  describe("getErrorMessage", () => {
    it("reads Error.message", () => {
      expect(getErrorMessage(new Error("boom"))).toBe("boom");
    });

    it("returns a string error as-is", () => {
      expect(getErrorMessage("plain error")).toBe("plain error");
    });

    it("reads message from a plain object", () => {
      expect(getErrorMessage({ message: "from object" })).toBe("from object");
    });

    it("uses fallback when object.message is not a string", () => {
      expect(getErrorMessage({ message: 404 }, FALLBACK)).toBe(FALLBACK);
    });

    it("uses fallback for unknown values", () => {
      expect(getErrorMessage(null, FALLBACK)).toBe(FALLBACK);
      expect(getErrorMessage(undefined, FALLBACK)).toBe(FALLBACK);
    });
  });

  describe("normalizeErrorMessage", () => {
    it("uses fallback for blank input", () => {
      expect(normalizeErrorMessage("   ", FALLBACK)).toBe(FALLBACK);
    });

    it("returns plain text when input is not JSON", () => {
      expect(normalizeErrorMessage("  Provider down  ")).toBe("Provider down");
    });

    it("prefers error, then message, then details from JSON", () => {
      expect(
        normalizeErrorMessage(
          JSON.stringify({ error: "from error", message: "from message" }),
        ),
      ).toBe("from error");

      expect(
        normalizeErrorMessage(JSON.stringify({ message: "from message" })),
      ).toBe("from message");

      expect(
        normalizeErrorMessage(JSON.stringify({ details: "from details" })),
      ).toBe("from details");
    });

    it("reads nested { message } fields inside JSON payloads", () => {
      expect(
        normalizeErrorMessage(
          JSON.stringify({ error: { message: "nested error" } }),
        ),
      ).toBe("nested error");

      expect(
        normalizeErrorMessage(
          JSON.stringify({ message: { message: "nested message" } }),
        ),
      ).toBe("nested message");

      expect(
        normalizeErrorMessage(
          JSON.stringify({ details: { message: "nested details" } }),
        ),
      ).toBe("nested details");
    });

    it("returns trimmed JSON text when no known fields are present", () => {
      const raw = JSON.stringify({ code: "E_UNKNOWN" });
      expect(normalizeErrorMessage(raw)).toBe(raw);
    });
  });

  describe("getDisplayErrorMessage", () => {
    it("combines getErrorMessage and normalizeErrorMessage", () => {
      const error = new Error(JSON.stringify({ message: "API failed" }));
      expect(getDisplayErrorMessage(error)).toBe("API failed");
    });

    it("uses the default unknown copy when nothing else is available", () => {
      expect(getDisplayErrorMessage(null)).toBe(ERROR_COPY.unknown);
    });
  });
});
