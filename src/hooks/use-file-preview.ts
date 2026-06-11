"use client";

import { useCallback, useEffect, useState } from "react";
import {
  convertDocxFileToHtml,
  readCodePreviewFile,
} from "@/utils/file-preview";
import type { CodeFilePreviewKind } from "@/types/file-attachment";

type FileKeyedPreview<T> = {
  file: File;
  value: T | null;
  hasFailed: boolean;
};

type FilePreviewResult<T> = {
  value: T | null;
  hasFailed: boolean;
  isLoading: boolean;
};

function derivePreviewResult<T>(
  file: File | undefined,
  preview: FileKeyedPreview<T> | null,
): FilePreviewResult<T> {
  const current = file != null && preview?.file === file ? preview : null;

  return {
    value: current?.value ?? null,
    hasFailed: current?.hasFailed ?? false,
    isLoading:
      file != null &&
      (current == null || (current.value == null && !current.hasFailed)),
  };
}

/** Read a local file as a data URL (image, PDF, audio, video). */
export function useFileDataUrl(file: File | undefined): {
  url: string | null;
  isLoading: boolean;
  hasFailed: boolean;
} {
  const [preview, setPreview] = useState<FileKeyedPreview<string> | null>(
    null,
  );

  useEffect(() => {
    if (!file) return;

    let cancelled = false;
    const reader = new FileReader();

    reader.onload = () => {
      if (cancelled || typeof reader.result !== "string") return;
      setPreview({ file, value: reader.result, hasFailed: false });
    };
    reader.onerror = () => {
      if (!cancelled) {
        setPreview({ file, value: null, hasFailed: true });
      }
    };
    reader.readAsDataURL(file);

    return () => {
      cancelled = true;
      reader.abort();
    };
  }, [file]);

  const { value, isLoading, hasFailed } = derivePreviewResult(file, preview);

  return {
    url: value,
    isLoading,
    hasFailed,
  };
}

/** Track `<img>` / media decode failures keyed by `File` (resets when file changes). */
export function useFileRenderFailure(file: File | undefined): {
  renderFailed: boolean;
  handleRenderError: () => void;
} {
  const [renderFailedFile, setRenderFailedFile] = useState<File | null>(null);
  const renderFailed = file != null && renderFailedFile === file;

  const handleRenderError = useCallback(() => {
    if (file) setRenderFailedFile(file);
  }, [file]);

  useEffect(() => {
    if (!file) return;
    return () => setRenderFailedFile(null);
  }, [file]);

  return { renderFailed, handleRenderError };
}

/** Data URL read + optional `<img>` / media decode failure (image, MP3, MP4). */
export function useDataUrlPreviewState(file: File | undefined): {
  url: string | null;
  failed: boolean;
  handleRenderError: () => void;
  isLoading: boolean;
} {
  const { url, isLoading, hasFailed } = useFileDataUrl(file);
  const { renderFailed, handleRenderError } = useFileRenderFailure(file);
  const failed = hasFailed || renderFailed;

  return {
    url,
    failed,
    handleRenderError,
    isLoading: !failed && (isLoading || url == null),
  };
}

/** Track async file reads keyed by `File` (DOCX HTML, CSV/JSON text, etc.). */
export function useAsyncFilePreview<T>(
  file: File | undefined,
  load: (input: File) => Promise<T>,
): FilePreviewResult<T> {
  const [preview, setPreview] = useState<FileKeyedPreview<T> | null>(null);

  useEffect(() => {
    if (!file) return;

    let cancelled = false;

    load(file)
      .then((value) => {
        if (!cancelled) {
          setPreview({ file, value, hasFailed: false });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPreview({ file, value: null, hasFailed: true });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [file, load]);

  return derivePreviewResult(file, preview);
}

export function useDocxPreview(docxFile: File | undefined): {
  html: string | null;
  isLoading: boolean;
  hasFailed: boolean;
} {
  const { value, isLoading, hasFailed } = useAsyncFilePreview(
    docxFile,
    convertDocxFileToHtml,
  );

  return {
    html: value,
    isLoading,
    hasFailed,
  };
}

export function useCodeFilePreview(
  file: File | undefined,
  kind: CodeFilePreviewKind,
): {
  text: string | null;
  isLoading: boolean;
  hasFailed: boolean;
} {
  const load = useCallback(
    (input: File) => readCodePreviewFile(input, kind),
    [kind],
  );
  const { value, isLoading, hasFailed } = useAsyncFilePreview(file, load);

  return {
    text: value,
    isLoading,
    hasFailed,
  };
}
