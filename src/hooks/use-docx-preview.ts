"use client";

import { useEffect, useRef, useState } from "react";
import {
  fitDocxPreviewToColumn,
  renderDocxFilePreview,
} from "@/utils/docx-preview";

export function useDocxPreview(docxFile: File | undefined) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const styleRef = useRef<HTMLDivElement>(null);
  const [renderedFile, setRenderedFile] = useState<File | null>(null);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    const body = bodyRef.current;
    const style = styleRef.current;
    if (!docxFile || !body || !style) return;

    let cancelled = false;
    setHasFailed(false);

    const scheduleFit = () => {
      requestAnimationFrame(() => {
        if (!cancelled) fitDocxPreviewToColumn(body);
      });
    };

    renderDocxFilePreview(docxFile, body, style)
      .then(() => {
        if (cancelled) return;
        setRenderedFile(docxFile);
        scheduleFit();
      })
      .catch(() => {
        if (cancelled) return;
        setHasFailed(true);
        body.replaceChildren();
        style.replaceChildren();
      });

    const resizeObserver = new ResizeObserver(scheduleFit);
    resizeObserver.observe(body);

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
      body.replaceChildren();
      style.replaceChildren();
    };
  }, [docxFile]);

  const isLoading =
    docxFile != null && renderedFile !== docxFile && !hasFailed;

  return {
    bodyRef,
    styleRef,
    isLoading,
    hasFailed: docxFile != null && hasFailed,
  };
}
