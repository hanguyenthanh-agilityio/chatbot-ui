"use client";

import { useEffect, useState } from "react";
import { convertDocxFileToHtml } from "@/utils/docx-preview";

export function useDocxPreview(docxFile: File | undefined) {
  const [html, setHtml] = useState<string | null>(null);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    if (!docxFile) return;

    let cancelled = false;
    setHtml(null);
    setHasFailed(false);

    convertDocxFileToHtml(docxFile)
      .then((value) => {
        if (!cancelled) setHtml(value);
      })
      .catch(() => {
        if (!cancelled) setHasFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [docxFile]);

  const isLoading = docxFile != null && html == null && !hasFailed;

  return {
    html,
    isLoading,
    hasFailed: docxFile != null && hasFailed,
  };
}
