"use client";

import { useCallback, useState } from "react";
import type { ComposerAttachment } from "@/lib/file-preview/types";
import {
  createAttachmentId,
  inferFilePreviewKind,
  isSupportedPreviewKind,
} from "@/lib/file-preview/utils";

export type UseComposerAttachmentResult = {
  attachedFile: ComposerAttachment | null;
  attachFile: (file: File) => void;
  clearAttachment: () => void;
};

export function useComposerAttachment(): UseComposerAttachmentResult {
  const [attachedFile, setAttachedFile] = useState<ComposerAttachment | null>(
    null,
  );

  const clearAttachment = useCallback(() => {
    setAttachedFile(null);
  }, []);

  const attachFile = useCallback((file: File) => {
    const kind = inferFilePreviewKind(file);
    if (!isSupportedPreviewKind(kind)) {
      return;
    }

    setAttachedFile({
      id: createAttachmentId("attach"),
      name: file.name,
      kind,
      sizeBytes: file.size,
      mimeType: file.type || undefined,
    });
  }, []);

  return {
    attachedFile,
    attachFile,
    clearAttachment,
  };
}
