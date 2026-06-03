import type { ChangeEvent } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  MOCK_RECENT_FILES,
  RECENT_FLYOUT_LAYOUT,
} from "@/constants/file-attachment";
import { FILE_PREVIEW_KIND } from "@/types/file-attachment";
import {
  createAttachmentId,
  formatFileSize,
  formatLibraryFileMeta,
  getRecentFlyoutPosition,
  inferFilePreviewKind,
  isSupportedPreviewKind,
  readSelectedFileFromInput,
} from "@/utils/file-attachment";

/** Build a DOMRect from box origin + size (matches layout math in tests). */
function mockBoundingRect({
  top,
  left,
  width,
  height,
}: {
  top: number;
  left: number;
  width: number;
  height: number;
}) {
  return {
    top,
    left,
    right: left + width,
    bottom: top + height,
    width,
    height,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;
}

function mockViewport(width: number, height: number) {
  Object.defineProperty(window, "innerWidth", {
    value: width,
    configurable: true,
  });
  Object.defineProperty(window, "innerHeight", {
    value: height,
    configurable: true,
  });
}

describe("inferFilePreviewKind", () => {
  it.each([
    ["report.pdf", "application/pdf", FILE_PREVIEW_KIND.PDF],
    ["clip.mp4", "video/mp4", FILE_PREVIEW_KIND.MP4],
    [
      "notes.docx",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      FILE_PREVIEW_KIND.DOCX,
    ],
  ] as const)("detects %s", (name, type, expected) => {
    expect(inferFilePreviewKind(new File(["x"], name, { type }))).toBe(
      expected,
    );
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
  it("joins formatted size and last-used label from mock recent file", () => {
    expect(formatLibraryFileMeta(MOCK_RECENT_FILES[0])).toBe(
      "240.0 KB · Yesterday",
    );
  });
});

describe("createAttachmentId", () => {
  it("prefixes generated ids", () => {
    expect(createAttachmentId("attach")).toMatch(/^attach-/);
  });
});

describe("readSelectedFileFromInput", () => {
  it("returns the selected file and resets the input", () => {
    const file = new File(["x"], "a.pdf", { type: "application/pdf" });
    const input = {
      files: [file],
      value: "C:\\fakepath\\a.pdf",
    } as unknown as HTMLInputElement;
    const event = { target: input } as ChangeEvent<HTMLInputElement>;

    expect(readSelectedFileFromInput(event)).toBe(file);
    expect(input.value).toBe("");
  });

  it("returns undefined when no file is selected", () => {
    const input = {
      files: [],
      value: "",
    } as unknown as HTMLInputElement;
    const event = { target: input } as ChangeEvent<HTMLInputElement>;

    expect(readSelectedFileFromInput(event)).toBeUndefined();
  });
});

describe("getRecentFlyoutPosition", () => {
  const { width, maxHeight, gap, viewportPadding } = RECENT_FLYOUT_LAYOUT;

  it("places the flyout to the right of the menu when there is room", () => {
    const menu = document.createElement("div");
    const menuBox = { top: 60, left: 40, width: 120, height: 120 };
    vi.spyOn(menu, "getBoundingClientRect").mockReturnValue(
      mockBoundingRect(menuBox),
    );
    mockViewport(1200, 800);

    expect(getRecentFlyoutPosition(document.createElement("div"), menu)).toEqual(
      {
        top: menuBox.top,
        left: menuBox.left + menuBox.width + gap,
      },
    );
  });

  it("flips the flyout to the left when the right edge would overflow", () => {
    const menu = document.createElement("div");
    const menuBox = { top: 60, left: 900, width: 120, height: 120 };
    vi.spyOn(menu, "getBoundingClientRect").mockReturnValue(
      mockBoundingRect(menuBox),
    );
    mockViewport(1200, 800);

    expect(getRecentFlyoutPosition(document.createElement("div"), menu)).toEqual(
      {
        top: menuBox.top,
        left: menuBox.left - width - gap,
      },
    );
  });

  it("clamps top when the flyout would overflow the viewport bottom", () => {
    const menu = document.createElement("div");
    const menuBox = { top: 600, left: 40, width: 120, height: 120 };
    vi.spyOn(menu, "getBoundingClientRect").mockReturnValue(
      mockBoundingRect(menuBox),
    );
    mockViewport(1200, 800);

    expect(getRecentFlyoutPosition(document.createElement("div"), menu)).toEqual(
      {
        top: 800 - maxHeight - viewportPadding,
        left: menuBox.left + menuBox.width + gap,
      },
    );
  });
});
