import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FilePreviewMp3, FilePreviewMp4 } from "@/components/chat/file-preview-media";
import { getFilePreviewMessages } from "@/constants/file-attachment";
import { useFileDataUrl } from "@/hooks/use-file-preview";
import { FILE_PREVIEW_KIND } from "@/types/file-attachment";

vi.mock("@/hooks/use-file-preview", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/hooks/use-file-preview")>();
  return {
    ...actual,
    useFileDataUrl: vi.fn(),
  };
});

const mockUseFileDataUrl = vi.mocked(useFileDataUrl);

const MP4_FILE = new File(["video"], "walkthrough.mp4", { type: "video/mp4" });
const MP4_FILE_ALT = new File(["video-alt"], "other.mp4", { type: "video/mp4" });
const MP3_FILE = new File(["audio"], "note.mp3", { type: "audio/mpeg" });
const MP3_FILE_ALT = new File(["audio-alt"], "other.mp3", { type: "audio/mpeg" });
const DATA_URL = "data:video/mp4;base64,AAAA";

function mockDataUrlState(state: Partial<ReturnType<typeof useFileDataUrl>>) {
  mockUseFileDataUrl.mockReturnValue({
    url: null,
    isLoading: false,
    hasFailed: false,
    ...state,
  });
}

describe.each([
  [
    "MP4",
    FilePreviewMp4,
    MP4_FILE,
    MP4_FILE_ALT,
    FILE_PREVIEW_KIND.MP4,
    ".file-preview-mp4",
    "video",
  ],
  [
    "MP3",
    FilePreviewMp3,
    MP3_FILE,
    MP3_FILE_ALT,
    FILE_PREVIEW_KIND.MP3,
    ".file-preview-mp3",
    "audio",
  ],
] as const)(
  "FilePreview%s",
  (_label, Component, file, altFile, kind, selector, tagName) => {
    const messages = getFilePreviewMessages(kind);

    afterEach(cleanup);

    beforeEach(() => {
      mockUseFileDataUrl.mockReset();
    });

    it("tells the user when no file is selected for preview", () => {
      mockDataUrlState({});

      render(<Component file={undefined} name={file.name} />);

      expect(screen.getByText(messages.missingFile)).toBeInTheDocument();
    });

    it("shows a loading message while the file is read", () => {
      mockDataUrlState({ isLoading: true });

      const { container } = render(<Component file={file} name={file.name} />);

      expect(screen.getByText(messages.loading)).toBeInTheDocument();
      expect(container.querySelector(selector)).not.toBeInTheDocument();
    });

    it("shows a failure message when the file cannot be read", () => {
      mockDataUrlState({ hasFailed: true });

      const { container } = render(<Component file={file} name={file.name} />);

      expect(screen.getByText(messages.failed)).toBeInTheDocument();
      expect(container.querySelector(selector)).not.toBeInTheDocument();
    });

    it(`renders a native ${tagName} player when preview is ready`, () => {
      mockDataUrlState({ url: DATA_URL });

      const { container } = render(<Component file={file} name={file.name} />);

      const player = container.querySelector(selector);
      expect(player).toBeInTheDocument();
      expect(player?.tagName.toLowerCase()).toBe(tagName);
      expect(player).toHaveAttribute("src", DATA_URL);
      expect(player).toHaveAttribute("controls");
      expect(screen.queryByText(messages.loading)).not.toBeInTheDocument();
    });

    it("shows a failure message when the player fires onError", () => {
      mockDataUrlState({ url: DATA_URL });

      const { container } = render(<Component file={file} name={file.name} />);

      const player = container.querySelector(selector);
      expect(player).toBeInTheDocument();

      fireEvent.error(player!);

      expect(screen.getByText(messages.failed)).toBeInTheDocument();
      expect(container.querySelector(selector)).not.toBeInTheDocument();
    });

    it("clears render failure when the selected file changes", () => {
      mockDataUrlState({ url: DATA_URL });

      const { container, rerender } = render(
        <Component file={file} name={file.name} />,
      );

      const player = container.querySelector(selector);
      fireEvent.error(player!);
      expect(screen.getByText(messages.failed)).toBeInTheDocument();

      rerender(<Component file={altFile} name={altFile.name} />);

      expect(screen.queryByText(messages.failed)).not.toBeInTheDocument();
      expect(container.querySelector(selector)).toBeInTheDocument();
    });
  },
);
