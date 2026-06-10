import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FilePreviewPdf } from "@/components/chat/file-preview-pdf";
import { getFilePreviewMessages } from "@/constants/file-attachment";
import { useFileDataUrl } from "@/hooks/use-file-preview";
import { FILE_PREVIEW_KIND } from "@/types/file-attachment";
import { withPdfEmbedParams } from "@/utils/file-preview";

vi.mock("@/hooks/use-file-preview");

const mockUseFileDataUrl = vi.mocked(useFileDataUrl);

const PDF_FILE = new File(["pdf"], "handbook.pdf", { type: "application/pdf" });
const DATA_URL = "data:application/pdf;base64,AAAA";
const PDF_MESSAGES = getFilePreviewMessages(FILE_PREVIEW_KIND.PDF);

function mockPreviewState(state: Partial<ReturnType<typeof useFileDataUrl>>) {
  mockUseFileDataUrl.mockReturnValue({
    url: null,
    isLoading: false,
    hasFailed: false,
    ...state,
  });
}

describe("FilePreviewPdf", () => {
  afterEach(cleanup);

  beforeEach(() => {
    mockUseFileDataUrl.mockReset();
  });

  it("tells the user when no file is selected for preview", () => {
    mockPreviewState({});

    render(<FilePreviewPdf file={undefined} name={PDF_FILE.name} />);

    expect(screen.getByText(PDF_MESSAGES.missingFile)).toBeInTheDocument();
  });

  it("shows a loading message while the file is read", () => {
    mockPreviewState({ isLoading: true });

    const { container } = render(
      <FilePreviewPdf file={PDF_FILE} name={PDF_FILE.name} />,
    );

    expect(screen.getByText(PDF_MESSAGES.loading)).toBeInTheDocument();
    expect(
      container.querySelector(".file-preview-pdf-frame"),
    ).not.toBeInTheDocument();
  });

  it("shows a failure message when the file cannot be read", () => {
    mockPreviewState({ hasFailed: true });

    const { container } = render(
      <FilePreviewPdf file={PDF_FILE} name={PDF_FILE.name} />,
    );

    expect(screen.getByText(PDF_MESSAGES.failed)).toBeInTheDocument();
    expect(
      container.querySelector(".file-preview-pdf-frame"),
    ).not.toBeInTheDocument();
  });

  it("renders a PDF iframe when preview is ready", () => {
    mockPreviewState({ url: DATA_URL });

    const { container } = render(
      <FilePreviewPdf file={PDF_FILE} name={PDF_FILE.name} />,
    );

    const frame = container.querySelector(".file-preview-pdf-frame");
    expect(frame).toBeInTheDocument();
    expect(frame).toHaveAttribute("title", PDF_FILE.name);
    expect(frame).toHaveAttribute("src", withPdfEmbedParams(DATA_URL));
    expect(screen.queryByText(PDF_MESSAGES.loading)).not.toBeInTheDocument();
  });
});
