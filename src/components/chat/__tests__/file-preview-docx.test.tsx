import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FilePreviewDocx } from "@/components/chat/file-preview-docx";
import { useDocxPreview } from "@/hooks/use-docx-preview";

vi.mock("@/hooks/use-docx-preview");

const mockUseDocxPreview = vi.mocked(useDocxPreview);

const DOCX_FILE = new File(["docx"], "handbook.docx", {
  type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
});

function mockPreviewState(
  state: Partial<ReturnType<typeof useDocxPreview>>,
) {
  mockUseDocxPreview.mockReturnValue({
    bodyRef: { current: null },
    styleRef: { current: null },
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

  it.each([
    ["unavailable", { file: undefined, isLoading: false, hasFailed: false }],
    ["loading", { file: DOCX_FILE, isLoading: true, hasFailed: false }],
    ["failed", { file: DOCX_FILE, isLoading: false, hasFailed: true }],
    ["ready", { file: DOCX_FILE, isLoading: false, hasFailed: false }],
  ] as const)("matches snapshot (%s)", (_name, { file, isLoading, hasFailed }) => {
    mockPreviewState({ isLoading, hasFailed });

    const { container } = render(<FilePreviewDocx file={file} />);
    expect(container.firstElementChild?.outerHTML ?? "").toMatchSnapshot();
  });
});
