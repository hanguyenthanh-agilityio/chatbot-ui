import { describe, expect, it, vi } from "vitest";
import { RECENT_FLYOUT_LAYOUT } from "@/constants/file-attachment";
import { FILE_PREVIEW_KIND } from "@/types/file-attachment";
import {
  createAttachmentId,
  formatFileSize,
  formatLibraryFileMeta,
  getRecentFlyoutPosition,
  inferFilePreviewKind,
  isSupportedPreviewKind,
} from "@/utils/file-attachment";

describe("inferFilePreviewKind", () => {
  it.each([
    ["report.pdf", "application/pdf", FILE_PREVIEW_KIND.PDF],
    ["clip.mp4", "video/mp4", FILE_PREVIEW_KIND.MP4],
    ["notes.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", FILE_PREVIEW_KIND.DOCX],
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

describe("formatFileSize", () => {
  it.each([
    [512, "512 B"],
    [2048, "2.0 KB"],
    [1_048_576, "1.0 MB"],
  ] as const)("formats %i bytes", (bytes, expected) => {
    expect(formatFileSize(bytes)).toBe(expected);
  });
});

describe("formatLibraryFileMeta", () => {
  it("joins size and last-used label", () => {
    expect(
      formatLibraryFileMeta({
        id: "1",
        name: "a.pdf",
        kind: FILE_PREVIEW_KIND.PDF,
        sizeBytes: 245_760,
        lastUsedLabel: "Yesterday",
      }),
    ).toBe("240.0 KB · Yesterday");
  });
});

describe("createAttachmentId", () => {
  it("prefixes generated ids", () => {
    expect(createAttachmentId("attach")).toMatch(/^attach-/);
  });
});

describe("getRecentFlyoutPosition", () => {
  it("places flyout to the right of the menu panel", () => {
    const row = document.createElement("div");
    const menu = document.createElement("div");
    vi.spyOn(row, "getBoundingClientRect").mockReturnValue({
      top: 100,
      left: 80,
      right: 200,
      bottom: 140,
      width: 120,
      height: 40,
      x: 80,
      y: 100,
      toJSON: () => ({}),
    });
    vi.spyOn(menu, "getBoundingClientRect").mockReturnValue({
      top: 60,
      left: 40,
      right: 160,
      bottom: 180,
      width: 120,
      height: 120,
      x: 40,
      y: 60,
      toJSON: () => ({}),
    });

    Object.defineProperty(window, "innerWidth", { value: 1200, configurable: true });
    Object.defineProperty(window, "innerHeight", { value: 800, configurable: true });

    expect(getRecentFlyoutPosition(row, menu)).toEqual({
      top: 60,
      left: 160 + RECENT_FLYOUT_LAYOUT.gap,
    });
  });
});
