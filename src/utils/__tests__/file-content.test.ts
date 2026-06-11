import { afterEach, describe, expect, it, vi } from "vitest";
import { FILE_PREVIEW_KIND } from "@/types/file-attachment";

const { getText, destroy } = vi.hoisted(() => ({
  getText: vi.fn(),
  destroy: vi.fn(),
}));

vi.mock("pdf-parse", () => ({
  PDFParse: vi.fn(function PDFParse() {
    return { getText, destroy };
  }),
}));

import {
  isReadableAttachmentKind,
  readAttachmentContent,
} from "@/utils/file-content";

describe("file-content", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("isReadableAttachmentKind matches readers map", () => {
    expect(isReadableAttachmentKind(FILE_PREVIEW_KIND.PDF)).toBe(true);
    expect(isReadableAttachmentKind(FILE_PREVIEW_KIND.CSV)).toBe(true);
    expect(isReadableAttachmentKind(FILE_PREVIEW_KIND.JSON)).toBe(true);
    expect(isReadableAttachmentKind(FILE_PREVIEW_KIND.IMAGE)).toBe(false);
  });

  it("readAttachmentContent extracts PDF text via dynamic pdf-parse", async () => {
    getText.mockResolvedValue({ text: "  Policy text  " });
    destroy.mockResolvedValue(undefined);

    const file = new File(["pdf"], "policy.pdf", { type: "application/pdf" });
    const text = await readAttachmentContent(file, FILE_PREVIEW_KIND.PDF);

    expect(text).toBe("Policy text");
    expect(getText).toHaveBeenCalledTimes(1);
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  it("reuses cached pdf-parse module on a second PDF read", async () => {
    getText.mockResolvedValue({ text: "cached" });
    destroy.mockResolvedValue(undefined);

    const file = new File(["pdf"], "second.pdf", { type: "application/pdf" });
    await readAttachmentContent(file, FILE_PREVIEW_KIND.PDF);
    await readAttachmentContent(file, FILE_PREVIEW_KIND.PDF);

    expect(getText).toHaveBeenCalledTimes(2);
  });

  describe.each([
    [
      "CSV",
      FILE_PREVIEW_KIND.CSV,
      "name,score\nAda,10",
      "text/csv",
      "name,score\nAda,10",
    ],
    [
      "JSON",
      FILE_PREVIEW_KIND.JSON,
      '{"name":"Ada","score":10}',
      "application/json",
      '{\n  "name": "Ada",\n  "score": 10\n}',
    ],
  ] as const)(
    "CODE_ATTACHMENT_READERS → readCodePreviewFile (%s)",
    (_label, kind, raw, mimeType, expected) => {
      it("reads attachment text via readCodePreviewFile", async () => {
        const file = new File([raw], `data.${kind}`, { type: mimeType });
        const text = await readAttachmentContent(file, kind);
        expect(text).toBe(expected);
      });
    },
  );

  it("readAttachmentContent rejects invalid JSON", async () => {
    const file = new File(["{not json"], "broken.json", {
      type: "application/json",
    });

    await expect(
      readAttachmentContent(file, FILE_PREVIEW_KIND.JSON),
    ).rejects.toThrow(/Invalid JSON file/);
  });

  it("readAttachmentContent rejects unsupported kinds", async () => {
    const file = new File(["x"], "photo.png", { type: "image/png" });

    await expect(
      readAttachmentContent(file, FILE_PREVIEW_KIND.IMAGE),
    ).rejects.toThrow(/Unsupported attachment kind/);
  });
});
