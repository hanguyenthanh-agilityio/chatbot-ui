"use client";

import { useCallback, useState } from "react";
import type { ComposerAttachment } from "@/types/file-attachment";
import {
  createAttachmentId,
  inferFilePreviewKind,
  isSupportedPreviewKind,
} from "@/utils/file-attachment";

export function useComposerAttachment() {
  const [attachedFile, setAttachedFile] = useState<ComposerAttachment | null>(
    null,
  );

  const clearAttachment = useCallback(() => {
    setAttachedFile(null);
  }, []);

  const attachFile = useCallback((file: File) => {
    const kind = inferFilePreviewKind(file);
    if (!isSupportedPreviewKind(kind)) return;

    setAttachedFile({
      id: createAttachmentId("attach"),
      name: file.name,
      kind,
      sizeBytes: file.size,
      mimeType: file.type || undefined,
    });
  }, []);

  return { attachedFile, attachFile, clearAttachment };
}
