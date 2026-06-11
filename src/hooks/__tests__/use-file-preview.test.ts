import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  useAsyncFilePreview,
  useCodeFilePreview,
  useDataUrlPreviewState,
  useDocxPreview,
  useFileDataUrl,
  useFileRenderFailure,
} from "@/hooks/use-file-preview";
import { FILE_PREVIEW_KIND } from "@/types/file-attachment";
import {
  convertDocxFileToHtml,
  readCodePreviewFile,
} from "@/utils/file-preview";

vi.mock("@/utils/file-preview", () => ({
  convertDocxFileToHtml: vi.fn(),
  readCodePreviewFile: vi.fn(),
}));

type FileReaderMode = "success" | "error" | "non-string";

function installFileReaderMock(mode: FileReaderMode = "success") {
  const abort = vi.fn();

  class MockFileReader {
    result: string | ArrayBuffer | null =
      mode === "non-string"
        ? new ArrayBuffer(8)
        : "data:text/plain;base64,dGVzdA==";
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;

    readAsDataURL = vi.fn(() => {
      queueMicrotask(() => {
        if (mode === "error") {
          this.onerror?.();
          return;
        }
        this.onload?.();
      });
    });

    abort = abort;
  }

  vi.stubGlobal("FileReader", MockFileReader as unknown as typeof FileReader);

  return { abort };
}

describe("useFileDataUrl", () => {
  beforeEach(() => {
    installFileReaderMock();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("is idle without a file", () => {
    const { result } = renderHook(() => useFileDataUrl(undefined));

    expect(result.current).toEqual({
      url: null,
      isLoading: false,
      hasFailed: false,
    });
  });

  it("loads a data URL and reports read failures", async () => {
    const file = new File(["hello"], "note.txt", { type: "text/plain" });
    const { result, rerender } = renderHook(
      ({ input }) => useFileDataUrl(input),
      {
        initialProps: { input: file },
      },
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.url).toBe("data:text/plain;base64,dGVzdA==");
    });
    expect(result.current).toMatchObject({
      isLoading: false,
      hasFailed: false,
    });

    installFileReaderMock("error");
    rerender({ input: new File(["bad"], "bad.txt", { type: "text/plain" }) });

    await waitFor(() => {
      expect(result.current.hasFailed).toBe(true);
    });
    expect(result.current.url).toBeNull();
  });

  it("ignores non-string reader results", async () => {
    installFileReaderMock("non-string");
    const file = new File(["x"], "image.bin");
    const { result } = renderHook(() => useFileDataUrl(file));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current).toEqual({
      url: null,
      isLoading: true,
      hasFailed: false,
    });
  });

  it("aborts the reader on unmount and ignores late read errors", () => {
    let triggerError!: () => void;
    const abort = vi.fn();

    class MockFileReader {
      onerror: (() => void) | null = null;
      readAsDataURL = vi.fn(function (this: MockFileReader) {
        triggerError = () => this.onerror?.();
      });
      abort = abort;
    }

    vi.stubGlobal("FileReader", MockFileReader as unknown as typeof FileReader);

    const file = new File(["x"], "note.txt");
    const { unmount } = renderHook(() => useFileDataUrl(file));

    unmount();

    act(() => {
      triggerError();
    });

    expect(abort).toHaveBeenCalled();
  });
});

describe("useFileRenderFailure", () => {
  it("tracks render failures for the current file and clears on change", () => {
    const first = new File(["a"], "first.png", { type: "image/png" });
    const second = new File(["b"], "second.png", { type: "image/png" });

    const { result, rerender } = renderHook(
      ({ file }) => useFileRenderFailure(file),
      {
        initialProps: { file: first as File | undefined },
      },
    );

    expect(result.current.renderFailed).toBe(false);

    act(() => {
      result.current.handleRenderError();
    });
    expect(result.current.renderFailed).toBe(true);

    rerender({ file: second });
    expect(result.current.renderFailed).toBe(false);
  });

  it("does nothing when there is no file", () => {
    const { result } = renderHook(() => useFileRenderFailure(undefined));

    act(() => {
      result.current.handleRenderError();
    });

    expect(result.current.renderFailed).toBe(false);
  });
});

describe("useDataUrlPreviewState", () => {
  beforeEach(() => {
    installFileReaderMock();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("combines data URL loading with render failure handling", async () => {
    const file = new File(["hello"], "photo.png", { type: "image/png" });
    const { result } = renderHook(() => useDataUrlPreviewState(file));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.failed).toBe(false);

    await waitFor(() => {
      expect(result.current.url).toBe("data:text/plain;base64,dGVzdA==");
    });
    expect(result.current.isLoading).toBe(false);

    act(() => {
      result.current.handleRenderError();
    });

    expect(result.current.failed).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });
});

describe("useAsyncFilePreview", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("is idle without a file", () => {
    const load = vi.fn();
    const { result } = renderHook(() => useAsyncFilePreview(undefined, load));

    expect(result.current).toEqual({
      value: null,
      isLoading: false,
      hasFailed: false,
    });
    expect(load).not.toHaveBeenCalled();
  });

  it("resolves preview text and surfaces load errors", async () => {
    const file = new File(["a"], "a.txt");
    const load = vi
      .fn()
      .mockResolvedValueOnce("loaded")
      .mockRejectedValueOnce(new Error("read failed"));

    const { result, rerender } = renderHook(
      ({ input }) => useAsyncFilePreview(input, load),
      { initialProps: { input: file } },
    );

    await waitFor(() => {
      expect(result.current.value).toBe("loaded");
    });
    expect(result.current.isLoading).toBe(false);

    rerender({ input: new File(["b"], "b.txt") });

    await waitFor(() => {
      expect(result.current.hasFailed).toBe(true);
    });
    expect(result.current.value).toBeNull();
  });

  it("drops stale results when the file changes mid-load", async () => {
    let resolveFirst!: (value: string) => void;
    const first = new File(["a"], "first.txt");
    const second = new File(["b"], "second.txt");
    const load = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<string>((resolve) => {
            resolveFirst = resolve;
          }),
      )
      .mockResolvedValueOnce("second");

    const { result, rerender } = renderHook(
      ({ file }) => useAsyncFilePreview(file, load),
      { initialProps: { file: first } },
    );

    rerender({ file: second });

    await waitFor(() => {
      expect(result.current.value).toBe("second");
    });

    await act(async () => {
      resolveFirst("stale");
      await Promise.resolve();
    });

    expect(result.current.value).toBe("second");
  });

  it("ignores load errors after unmount", async () => {
    let rejectLoad!: (reason?: unknown) => void;
    const load = vi.fn(
      () =>
        new Promise<string>((_, reject) => {
          rejectLoad = reject;
        }),
    );
    const { unmount } = renderHook(() =>
      useAsyncFilePreview(new File(["x"], "x.txt"), load),
    );

    unmount();

    await act(async () => {
      rejectLoad(new Error("late"));
      await Promise.resolve();
    });
  });
});

describe("useDocxPreview", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads HTML through convertDocxFileToHtml", async () => {
    vi.mocked(convertDocxFileToHtml).mockResolvedValue("<p>Doc</p>");
    const file = new File(["docx"], "report.docx");

    const { result } = renderHook(() => useDocxPreview(file));

    await waitFor(() => {
      expect(result.current.html).toBe("<p>Doc</p>");
    });
    expect(convertDocxFileToHtml).toHaveBeenCalledWith(file);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.hasFailed).toBe(false);
  });
});

describe("useCodeFilePreview", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads text through readCodePreviewFile", async () => {
    vi.mocked(readCodePreviewFile).mockResolvedValue('{"ok":true}');
    const file = new File(["{}"], "data.json", { type: "application/json" });

    const { result } = renderHook(() =>
      useCodeFilePreview(file, FILE_PREVIEW_KIND.JSON),
    );

    await waitFor(() => {
      expect(result.current.text).toBe('{"ok":true}');
    });
    expect(readCodePreviewFile).toHaveBeenCalledWith(
      file,
      FILE_PREVIEW_KIND.JSON,
    );
    expect(result.current.isLoading).toBe(false);
    expect(result.current.hasFailed).toBe(false);
  });
});
