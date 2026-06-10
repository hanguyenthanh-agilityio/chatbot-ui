import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FilePreviewPanel } from "@/components/chat/file-preview-panel";
import {
  FILE_KIND_LABEL,
  FILE_PREVIEW_COPY,
  FILE_PREVIEW_PANEL_WIDTH,
} from "@/constants/file-attachment";
import { MOCK_COMPOSER_ATTACHMENT } from "@/mocks/file-attachment";
import type { ComposerAttachment } from "@/types/file-attachment";
import { FILE_PREVIEW_KIND } from "@/types/file-attachment";
import {
  bindFilePreviewPanelResize,
  formatFileSize,
} from "@/utils/file-attachment";

vi.mock("@/components/chat/file-preview-image", () => ({
  FilePreviewImage: ({ name }: { name: string }) => (
    <div data-testid="preview-image">{name}</div>
  ),
}));

vi.mock("@/components/chat/file-preview-docx", () => ({
  FilePreviewDocx: () => <div data-testid="preview-docx" />,
}));

vi.mock("@/components/chat/file-preview-pdf", () => ({
  FilePreviewPdf: ({ name }: { name: string }) => (
    <div data-testid="preview-pdf">{name}</div>
  ),
}));

vi.mock("@/components/chat/file-preview-media", () => ({
  FilePreviewMp4: ({ name }: { name: string }) => (
    <div data-testid="preview-mp4">{name}</div>
  ),
  FilePreviewMp3: ({ name }: { name: string }) => (
    <div data-testid="preview-mp3">{name}</div>
  ),
}));

vi.mock("@/components/chat/file-preview-common", () => ({
  FilePreviewCodeFile: ({ kind }: { kind: string }) => (
    <div data-testid={`preview-${kind}`} />
  ),
}));

vi.mock("@/utils/file-attachment", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/utils/file-attachment")>();
  return {
    ...actual,
    bindFilePreviewPanelResize: vi.fn(),
  };
});

const mockBindResize = vi.mocked(bindFilePreviewPanelResize);

function renderPanel(
  file: ComposerAttachment = MOCK_COMPOSER_ATTACHMENT,
  {
    width = 320,
    onWidthChange = vi.fn(),
    onClose = vi.fn(),
  }: {
    width?: number | null;
    onWidthChange?: (width: number) => void;
    onClose?: () => void;
  } = {},
) {
  render(
    <FilePreviewPanel
      file={file}
      width={width}
      onWidthChange={onWidthChange}
      onClose={onClose}
    />,
  );

  return { onWidthChange, onClose };
}

describe("FilePreviewPanel", () => {
  afterEach(cleanup);

  beforeEach(() => {
    mockBindResize.mockReset();
  });

  it("hides the size badge when sizeBytes is missing", () => {
    renderPanel({ ...MOCK_COMPOSER_ATTACHMENT, sizeBytes: undefined });

    expect(
      screen.queryByText(formatFileSize(MOCK_COMPOSER_ATTACHMENT.sizeBytes!)),
    ).not.toBeInTheDocument();
  });

  it("shows unavailable copy for unsupported file kinds", () => {
    renderPanel({
      ...MOCK_COMPOSER_ATTACHMENT,
      kind: FILE_PREVIEW_KIND.UNKNOWN,
    });

    expect(
      screen.getByText(FILE_PREVIEW_COPY.previewUnavailable),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("preview-pdf")).not.toBeInTheDocument();
  });

  it.each([
    [FILE_PREVIEW_KIND.IMAGE, "preview-image"],
    [FILE_PREVIEW_KIND.DOCX, "preview-docx"],
    [FILE_PREVIEW_KIND.PDF, "preview-pdf"],
    [FILE_PREVIEW_KIND.MP4, "preview-mp4"],
    [FILE_PREVIEW_KIND.MP3, "preview-mp3"],
    [FILE_PREVIEW_KIND.CSV, "preview-csv"],
    [FILE_PREVIEW_KIND.JSON, "preview-json"],
  ] as const)("renders the %s preview renderer", (kind, testId) => {
    renderPanel({ ...MOCK_COMPOSER_ATTACHMENT, kind });

    expect(screen.getByTestId(testId)).toBeInTheDocument();
  });

  it("starts resize drag from the separator handle", () => {
    const onWidthChange = vi.fn();
    renderPanel(MOCK_COMPOSER_ATTACHMENT, { width: 320, onWidthChange });

    const handle = screen.getByRole("separator", {
      name: FILE_PREVIEW_COPY.resizePreviewLabel,
    });

    expect(handle).toHaveAttribute(
      "aria-valuemin",
      String(FILE_PREVIEW_PANEL_WIDTH.min),
    );
    expect(handle).toHaveAttribute(
      "aria-valuemax",
      String(FILE_PREVIEW_PANEL_WIDTH.max),
    );
    expect(handle).toHaveAttribute("aria-valuenow", "320");

    fireEvent.pointerDown(handle, { clientX: 400, pointerId: 7 });

    expect(mockBindResize).toHaveBeenCalledWith(
      expect.objectContaining({
        handle,
        pointerId: 7,
        startX: 400,
        startWidth: 320,
        onWidthChange,
      }),
    );
  });
});
