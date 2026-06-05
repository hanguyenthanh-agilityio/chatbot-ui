import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDocxPreview } from "@/hooks/use-docx-preview";

const convertDocxFileToHtml = vi.fn();

vi.mock("@/utils/docx-preview", () => ({
  convertDocxFileToHtml: (...args: unknown[]) => convertDocxFileToHtml(...args),
}));

const DOCX_FILE = new File(["docx"], "report.docx", {
  type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
});

function DocxPreviewHost({ file }: { file?: File }) {
  const preview = useDocxPreview(file);

  return (
    <>
      <span data-testid="html">{preview.html ?? ""}</span>
      <span data-testid="loading">{String(preview.isLoading)}</span>
      <span data-testid="failed">{String(preview.hasFailed)}</span>
    </>
  );
}

describe("useDocxPreview", () => {
  beforeEach(() => {
    convertDocxFileToHtml.mockReset();
    convertDocxFileToHtml.mockResolvedValue("<p>OK</p>");
  });

  afterEach(() => {
    cleanup();
  });

  it("is idle when no file is provided", () => {
    render(<DocxPreviewHost />);

    expect(screen.getByTestId("loading")).toHaveTextContent("false");
    expect(screen.getByTestId("failed")).toHaveTextContent("false");
    expect(convertDocxFileToHtml).not.toHaveBeenCalled();
  });

  it("loads HTML when conversion succeeds", async () => {
    render(<DocxPreviewHost file={DOCX_FILE} />);

    await waitFor(() => {
      expect(convertDocxFileToHtml).toHaveBeenCalledWith(DOCX_FILE);
    });

    await waitFor(() => {
      expect(screen.getByTestId("html")).toHaveTextContent("<p>OK</p>");
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
      expect(screen.getByTestId("failed")).toHaveTextContent("false");
    });
  });

  it("marks preview as failed when conversion throws", async () => {
    convertDocxFileToHtml.mockRejectedValue(new Error("convert failed"));

    render(<DocxPreviewHost file={DOCX_FILE} />);

    await waitFor(() => {
      expect(screen.getByTestId("failed")).toHaveTextContent("true");
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });
  });
});
