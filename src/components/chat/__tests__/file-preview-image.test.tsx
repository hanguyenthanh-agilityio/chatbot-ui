import type { ImgHTMLAttributes } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FilePreviewImage } from "@/components/chat/file-preview-image";
import { getFilePreviewMessages } from "@/constants/file-attachment";
import { useDataUrlPreviewState } from "@/hooks/use-file-preview";
import { FILE_PREVIEW_KIND } from "@/types/file-attachment";

vi.mock("next/image", () => ({
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}));

vi.mock("@/hooks/use-file-preview", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/hooks/use-file-preview")>();
  return {
    ...actual,
    useDataUrlPreviewState: vi.fn(),
  };
});

const mockUseDataUrlPreviewState = vi.mocked(useDataUrlPreviewState);

const IMAGE_FILE = new File(["image"], "photo.png", { type: "image/png" });

const DATA_URL = "data:image/png;base64,AAAA";
const IMAGE_MESSAGES = getFilePreviewMessages(FILE_PREVIEW_KIND.IMAGE);

function mockDataUrlState(
  state: Partial<ReturnType<typeof useDataUrlPreviewState>>,
) {
  mockUseDataUrlPreviewState.mockReturnValue({
    url: null,
    failed: false,
    isLoading: false,
    handleRenderError: vi.fn(),
    ...state,
  });
}

describe("FilePreviewImage", () => {
  afterEach(cleanup);

  beforeEach(() => {
    mockUseDataUrlPreviewState.mockReset();
  });

  it("renders an image when preview is ready", () => {
    mockDataUrlState({ url: DATA_URL });

    render(<FilePreviewImage file={IMAGE_FILE} name={IMAGE_FILE.name} />);

    const image = screen.getByRole("img", { name: IMAGE_FILE.name });
    expect(image).toHaveAttribute("src", DATA_URL);
    expect(screen.queryByText(IMAGE_MESSAGES.loading)).not.toBeInTheDocument();
  });
});
