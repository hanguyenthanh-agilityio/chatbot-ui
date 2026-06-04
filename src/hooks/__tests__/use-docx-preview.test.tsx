import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDocxPreview } from "@/hooks/use-docx-preview";

const renderDocxFilePreview = vi.fn();
const fitDocxPreviewToColumn = vi.fn();

vi.mock("@/utils/docx-preview", () => ({
  renderDocxFilePreview: (...args: unknown[]) => renderDocxFilePreview(...args),
  fitDocxPreviewToColumn: (...args: unknown[]) => fitDocxPreviewToColumn(...args),
}));

const DOCX_FILE = new File(["docx"], "report.docx", {
  type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
});

function DocxPreviewHost({ file }: { file?: File }) {
  const preview = useDocxPreview(file);

  return (
    <>
      <div ref={preview.bodyRef} data-testid="body" />
      <div ref={preview.styleRef} data-testid="style" />
      <span data-testid="loading">{String(preview.isLoading)}</span>
      <span data-testid="failed">{String(preview.hasFailed)}</span>
    </>
  );
}

describe("useDocxPreview", () => {
  beforeEach(() => {
    renderDocxFilePreview.mockReset();
    fitDocxPreviewToColumn.mockReset();
    renderDocxFilePreview.mockResolvedValue(undefined);

    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });

    class ResizeObserverStub {
      observe() {}
      disconnect() {}
    }
    vi.stubGlobal("ResizeObserver", ResizeObserverStub);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("is idle when no file is provided", () => {
    render(<DocxPreviewHost />);

    expect(screen.getByTestId("loading")).toHaveTextContent("false");
    expect(screen.getByTestId("failed")).toHaveTextContent("false");
    expect(renderDocxFilePreview).not.toHaveBeenCalled();
  });

  it("loads the docx and clears loading when render succeeds", async () => {
    render(<DocxPreviewHost file={DOCX_FILE} />);

    await waitFor(() => {
      expect(renderDocxFilePreview).toHaveBeenCalledWith(
        DOCX_FILE,
        expect.any(HTMLDivElement),
        expect.any(HTMLDivElement),
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });
    expect(screen.getByTestId("failed")).toHaveTextContent("false");
    expect(fitDocxPreviewToColumn).toHaveBeenCalled();
  });

  it("marks preview as failed when render throws", async () => {
    renderDocxFilePreview.mockRejectedValue(new Error("render failed"));

    render(<DocxPreviewHost file={DOCX_FILE} />);

    await waitFor(() => {
      expect(screen.getByTestId("failed")).toHaveTextContent("true");
    });
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
  });
});
