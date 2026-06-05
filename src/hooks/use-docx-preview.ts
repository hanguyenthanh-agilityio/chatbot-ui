"use client";

import { useEffect, useState } from "react";
import { convertDocxFileToHtml } from "@/utils/docx-preview";

type DocxPreviewState = {
  file: File;
  html: string | null;
  hasFailed: boolean;
};

export function useDocxPreview(docxFile: File | undefined) {
  const [preview, setPreview] = useState<DocxPreviewState | null>(null);

  useEffect(() => {
    if (!docxFile) return;

    let cancelled = false;

    convertDocxFileToHtml(docxFile)
      .then((value) => {
        if (!cancelled) {
          setPreview({ file: docxFile, html: value, hasFailed: false });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPreview({ file: docxFile, html: null, hasFailed: true });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [docxFile]);

  const current =
    docxFile != null && preview?.file === docxFile ? preview : null;
  const html = current?.html ?? null;
  const hasFailed = current?.hasFailed ?? false;
  const isLoading =
    docxFile != null &&
    (current == null || (current.html == null && !current.hasFailed));

  return {
    html,
    isLoading,
    hasFailed,
  };
}
