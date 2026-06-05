import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FilePreviewDocx } from "@/components/chat/file-preview-docx";
import { useDocxPreview } from "@/hooks/use-docx-preview";

vi.mock("@/hooks/use-docx-preview");

const mockUseDocxPreview = vi.mocked(useDocxPreview);

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

  it.each([
    [
      "unavailable",
      { file: undefined, isLoading: false, hasFailed: false, html: null },
    ],
    [
      "loading",
      { file: DOCX_FILE, isLoading: true, hasFailed: false, html: null },
    ],
    [
      "failed",
      { file: DOCX_FILE, isLoading: false, hasFailed: true, html: null },
    ],
    [
      "ready",
      {
        file: DOCX_FILE,
        isLoading: false,
        hasFailed: false,
        html: "<p>Preview</p>",
      },
    ],
  ] as const)(
    "matches snapshot (%s)",
    (_name, { file, isLoading, hasFailed, html }) => {
      mockPreviewState({ isLoading, hasFailed, html });

      const { container } = render(<FilePreviewDocx file={file} />);
      expect(container.firstElementChild?.outerHTML ?? "").toMatchSnapshot();
    },
  );
});
