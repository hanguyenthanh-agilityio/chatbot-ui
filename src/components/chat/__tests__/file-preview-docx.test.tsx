import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FilePreviewDocx } from "@/components/chat/file-preview-docx";
import { getFilePreviewMessages } from "@/constants/file-attachment";
import { useDocxPreview } from "@/hooks/use-file-preview";
import { FILE_PREVIEW_KIND } from "@/types/file-attachment";

vi.mock("@/hooks/use-file-preview");

const mockUseDocxPreview = vi.mocked(useDocxPreview);

const DOCX_MESSAGES = getFilePreviewMessages(FILE_PREVIEW_KIND.DOCX);

const DOCX_FILE = new File(["docx"], "handbook.docx", {
  type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
});

function mockPreviewState(state: Partial<ReturnType<typeof useDocxPreview>>) {
  mockUseDocxPreview.mockReturnValue({
    html: null,
    isLoading: false,
    hasFailed: false,
    ...state,
  });
}

describe("FilePreviewDocx", () => {
  afterEach(cleanup);

  beforeEach(() => {
    mockUseDocxPreview.mockReset();
  });

  it("tells the user when no file is selected for preview", () => {
    mockPreviewState({});

    render(<FilePreviewDocx file={undefined} />);

    expect(screen.getByText(DOCX_MESSAGES.missingFile)).toBeInTheDocument();
  });

  it("shows a loading message while the document is converting", () => {
    mockPreviewState({ isLoading: true });

    const { container } = render(<FilePreviewDocx file={DOCX_FILE} />);

    expect(screen.getByText(DOCX_MESSAGES.loading)).toBeInTheDocument();
    expect(
      container.querySelector(".file-preview-docx-html"),
    ).not.toBeInTheDocument();
  });

  it("shows a failure message when conversion fails", () => {
    mockPreviewState({ hasFailed: true });

    const { container } = render(<FilePreviewDocx file={DOCX_FILE} />);

    expect(screen.getByText(DOCX_MESSAGES.failed)).toBeInTheDocument();
    expect(
      container.querySelector(".file-preview-docx-html"),
    ).not.toBeInTheDocument();
  });

  it("renders converted document HTML when preview is ready", () => {
    mockPreviewState({ html: "<p>Preview</p>" });

    const { container } = render(<FilePreviewDocx file={DOCX_FILE} />);

    expect(screen.getByText("Preview")).toBeInTheDocument();
    expect(screen.queryByText(DOCX_MESSAGES.loading)).not.toBeInTheDocument();
    expect(
      container.querySelector(".file-preview-docx-html"),
    ).toBeInTheDocument();
  });
});
