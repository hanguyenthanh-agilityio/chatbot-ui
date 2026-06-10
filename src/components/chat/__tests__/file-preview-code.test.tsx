import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FilePreviewCodeFile } from "@/components/chat/file-preview-common";
import { getFilePreviewMessages } from "@/constants/file-attachment";
import { useCodeFilePreview } from "@/hooks/use-file-preview";
import { FILE_PREVIEW_KIND } from "@/types/file-attachment";

vi.mock("@/hooks/use-file-preview");

const mockUseCodeFilePreview = vi.mocked(useCodeFilePreview);

const JSON_FILE = new File(['{"a":1}'], "data.json", { type: "application/json" });
const JSON_MESSAGES = getFilePreviewMessages(FILE_PREVIEW_KIND.JSON);

function mockPreviewState(
  state: Partial<ReturnType<typeof useCodeFilePreview>>,
) {
  mockUseCodeFilePreview.mockReturnValue({
    text: null,
    isLoading: false,
    hasFailed: false,
    ...state,
  });
}

describe("FilePreviewCodeFile", () => {
  afterEach(cleanup);

  beforeEach(() => {
    mockUseCodeFilePreview.mockReset();
  });

  it("tells the user when no file is selected for preview", () => {
    mockPreviewState({});

    render(
      <FilePreviewCodeFile file={undefined} kind={FILE_PREVIEW_KIND.JSON} />,
    );

    expect(screen.getByText(JSON_MESSAGES.missingFile)).toBeInTheDocument();
  });

  it("shows a loading message while the file is read", () => {
    mockPreviewState({ isLoading: true });

    const { container } = render(
      <FilePreviewCodeFile file={JSON_FILE} kind={FILE_PREVIEW_KIND.JSON} />,
    );

    expect(screen.getByText(JSON_MESSAGES.loading)).toBeInTheDocument();
    expect(container.querySelector(".file-preview-code")).not.toBeInTheDocument();
  });

  it("shows a failure message when the file cannot be read", () => {
    mockPreviewState({ hasFailed: true });

    const { container } = render(
      <FilePreviewCodeFile file={JSON_FILE} kind={FILE_PREVIEW_KIND.JSON} />,
    );

    expect(screen.getByText(JSON_MESSAGES.failed)).toBeInTheDocument();
    expect(container.querySelector(".file-preview-code")).not.toBeInTheDocument();
  });

  it("renders trimmed code with line numbers when preview is ready", () => {
    mockPreviewState({ text: '  line one\nline two\n  ' });

    const { container } = render(
      <FilePreviewCodeFile file={JSON_FILE} kind={FILE_PREVIEW_KIND.JSON} />,
    );

    const code = container.querySelector(".file-preview-code-body code");
    expect(code?.textContent).toBe("line one\nline two");

    const lineNumbers = container.querySelectorAll(
      ".file-preview-code-line-number",
    );
    expect(lineNumbers).toHaveLength(2);
    expect(lineNumbers[0]).toHaveTextContent("1");
    expect(lineNumbers[1]).toHaveTextContent("2");

    expect(screen.queryByText(JSON_MESSAGES.loading)).not.toBeInTheDocument();
  });
});
