import { afterEach, describe, expect, it, vi } from "vitest";
import { FILE_PREVIEW_PDF_EMBED } from "@/constants/file-attachment";
import { FILE_PREVIEW_KIND } from "@/types/file-attachment";

const { convertToHtml, extractRawText, sanitize } = vi.hoisted(() => ({
  convertToHtml: vi.fn(),
  extractRawText: vi.fn(),
  sanitize: vi.fn((html: string) => `safe:${html}`),
}));

vi.mock("mammoth", () => ({
  convertToHtml,
  extractRawText,
}));

vi.mock("dompurify", () => ({
  default: { sanitize },
}));

import {
  assertNonEmptyTrimmed,
  convertDocxFileToHtml,
  extractDocxFileText,
  readCodePreviewFile,
  withPdfEmbedParams,
} from "@/utils/file-preview";

describe("file-preview", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("assertNonEmptyTrimmed", () => {
    it("returns trimmed text", () => {
      expect(assertNonEmptyTrimmed("  hello  ")).toBe("hello");
    });

    it("throws when text is empty", () => {
      expect(() => assertNonEmptyTrimmed("   ")).toThrow(/File is empty/);
    });
  });

  describe("withPdfEmbedParams", () => {
    it("appends PDF viewer params to a data URL", () => {
      const url = "data:application/pdf;base64,abc";
      expect(withPdfEmbedParams(url)).toBe(
        `${url}#${FILE_PREVIEW_PDF_EMBED.fragment}`,
      );
    });

    it("replaces an existing hash fragment", () => {
      const url = "data:application/pdf;base64,abc#old=1";
      expect(withPdfEmbedParams(url)).toBe(
        `data:application/pdf;base64,abc#${FILE_PREVIEW_PDF_EMBED.fragment}`,
      );
    });
  });

  describe("readCodePreviewFile", () => {
    it("reads CSV and normalizes Windows line endings", async () => {
      const file = new File(["a,b\r\nc,d"], "data.csv", { type: "text/csv" });
      await expect(
        readCodePreviewFile(file, FILE_PREVIEW_KIND.CSV),
      ).resolves.toBe("a,b\nc,d");
    });

    it("throws for empty files", async () => {
      const file = new File(["   "], "empty.csv", { type: "text/csv" });
      await expect(
        readCodePreviewFile(file, FILE_PREVIEW_KIND.CSV),
      ).rejects.toThrow(/File is empty/);
    });
  });

  describe("convertDocxFileToHtml", () => {
    it("converts DOCX to sanitized HTML", async () => {
      convertToHtml.mockResolvedValue({ value: "<p>Hi</p>" });
      const file = new File(["docx"], "notes.docx", {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      await expect(convertDocxFileToHtml(file)).resolves.toBe("safe:<p>Hi</p>");
      expect(convertToHtml).toHaveBeenCalledWith(
        { arrayBuffer: expect.any(ArrayBuffer) },
        { externalFileAccess: false },
      );
      expect(sanitize).toHaveBeenCalledWith("<p>Hi</p>", {
        USE_PROFILES: { html: true },
      });
    });

    it("reuses the cached mammoth module on a second read", async () => {
      convertToHtml.mockResolvedValue({ value: "<p>Again</p>" });
      const file = new File(["docx"], "again.docx", {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      await convertDocxFileToHtml(file);
      await convertDocxFileToHtml(file);

      expect(convertToHtml).toHaveBeenCalledTimes(2);
    });
  });

  describe("extractDocxFileText", () => {
    it("extracts trimmed plain text", async () => {
      extractRawText.mockResolvedValue({ value: "  Report body  " });
      const file = new File(["docx"], "report.docx", {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      await expect(extractDocxFileText(file)).resolves.toBe("Report body");
    });
  });
});
