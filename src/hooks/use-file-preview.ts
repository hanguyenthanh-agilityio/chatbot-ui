"use client";

import { useCallback, useEffect, useState } from "react";
import {
  convertDocxFileToHtml,
  parseJsonFile,
  readCsvFileText,
} from "@/utils/file-preview";
import { FILE_PREVIEW_KIND } from "@/types/file-attachment";

type FileKeyedPreview<T> = {
  file: File;
  value: T | null;
  hasFailed: boolean;
};

function derivePreviewResult<T>(
  file: File | undefined,
  preview: FileKeyedPreview<T> | null,
) {
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
export function useFileDataUrl(file: File | undefined) {
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

/** Track async file conversion keyed by `File` (extend for other converters). */
export function useAsyncFilePreview<T>(
  file: File | undefined,
  load: (input: File) => Promise<T>,
) {
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

export function useDocxPreview(docxFile: File | undefined) {
  const loadDocx = useCallback(
    (file: File) => convertDocxFileToHtml(file),
    [],
  );
  const { value, isLoading, hasFailed } = useAsyncFilePreview(
    docxFile,
    loadDocx,
  );

  return {
    html: value,
    isLoading,
    hasFailed,
  };
}

export function useCodeFilePreview(
  file: File | undefined,
  kind: typeof FILE_PREVIEW_KIND.CSV | typeof FILE_PREVIEW_KIND.JSON,
) {
  const load = useCallback(
    (input: File) =>
      kind === FILE_PREVIEW_KIND.JSON
        ? parseJsonFile(input)
        : readCsvFileText(input),
    [kind],
  );
  const { value, isLoading, hasFailed } = useAsyncFilePreview(file, load);

  return {
    text: value,
    isLoading,
    hasFailed,
  };
}
