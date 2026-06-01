import { describe, expect, it } from "vitest";
import { FILE_PREVIEW_KIND } from "@/lib/file-preview/types";
import { inferFilePreviewKind, isSupportedPreviewKind } from "@/lib/file-preview/utils";

describe("inferFilePreviewKind", () => {
  it.each([
    ["report.pdf", "application/pdf", FILE_PREVIEW_KIND.PDF],
    ["clip.mp4", "video/mp4", FILE_PREVIEW_KIND.MP4],
  ] as const)("detects %s", (name, type, expected) => {
    expect(inferFilePreviewKind(new File(["x"], name, { type }))).toBe(expected);
  });

  it("returns unknown for unsupported files", () => {
    expect(inferFilePreviewKind(new File(["x"], "data.zip"))).toBe(
      FILE_PREVIEW_KIND.UNKNOWN,
    );
    expect(isSupportedPreviewKind(FILE_PREVIEW_KIND.UNKNOWN)).toBe(false);
  });
});
