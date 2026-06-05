"use client";

import { useCallback, useState, type Dispatch, type SetStateAction } from "react";
import {
  ATTACHMENT_CONTENT_READ_STATUS,
  type AttachmentContentReadStatus,
  type ComposerAttachment,
  type FilePreviewKind,
} from "@/types/file-attachment";
import {
  isReadableAttachmentKind,
  readAttachmentContent,
} from "@/utils/file-content";
import {
  createAttachmentId,
  inferFilePreviewKind,
  isSupportedPreviewKind,
} from "@/utils/file-attachment";

function patchAttachmentIfCurrent(
  setAttachedFile: Dispatch<SetStateAction<ComposerAttachment | null>>,
  attachmentId: string,
  patch: Partial<ComposerAttachment>,
) {
  setAttachedFile((current) =>
    current?.id === attachmentId ? { ...current, ...patch } : current,
  );
}

function initialContentReadStatus(
  readable: boolean,
): AttachmentContentReadStatus {
  return readable
    ? ATTACHMENT_CONTENT_READ_STATUS.PENDING
    : ATTACHMENT_CONTENT_READ_STATUS.UNSUPPORTED;
}

/** Fire-and-forget text extraction; ignores stale results after clear/replace. */
function queueAttachmentContentRead(
  file: File,
  kind: FilePreviewKind,
  attachmentId: string,
  setAttachedFile: Dispatch<SetStateAction<ComposerAttachment | null>>,
) {
  readAttachmentContent(file, kind)
    .then((content) => {
      patchAttachmentIfCurrent(setAttachedFile, attachmentId, {
        content,
        contentReadStatus: ATTACHMENT_CONTENT_READ_STATUS.READY,
      });
    })
    .catch(() => {
      patchAttachmentIfCurrent(setAttachedFile, attachmentId, {
        contentReadStatus: ATTACHMENT_CONTENT_READ_STATUS.FAILED,
      });
    });
}

/**
 * Composer attachment state: metadata + silent content read for AI/RAG.
 * Preview panel still reads files on its own when opened.
 */
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

    const attachmentId = createAttachmentId("attach");
    const readable = isReadableAttachmentKind(kind);

    setAttachedFile({
      id: attachmentId,
      name: file.name,
      kind,
      sizeBytes: file.size,
      mimeType: file.type || undefined,
      rawFile: file,
      contentReadStatus: initialContentReadStatus(readable),
    });

    if (readable) {
      queueAttachmentContentRead(file, kind, attachmentId, setAttachedFile);
    }
  }, []);

  return { attachedFile, attachFile, clearAttachment };
}
