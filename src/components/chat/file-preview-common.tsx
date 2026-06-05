"use client";

import type { ReactNode } from "react";
import { FileKindIcon } from "@/components/chat/file-kind-icon";
import { Text } from "@/components/ui/text";
import {
  FILE_PREVIEW_FALLBACK_CLASS,
  getFilePreviewMessages,
  type FilePreviewMediaKind,
} from "@/constants/file-attachment";
import type { FilePreviewKind } from "@/types/file-attachment";

function FilePreviewFallback({
  message,
  kind,
}: {
  message: string;
  kind?: FilePreviewKind;
}) {
  return (
    <div className={FILE_PREVIEW_FALLBACK_CLASS}>
      {kind != null ? <FileKindIcon kind={kind} /> : null}
      <Text variant="captionMuted">{message}</Text>
    </div>
  );
}

export function FilePreviewUnavailable({
  kind,
  message,
}: {
  kind: FilePreviewKind;
  message: string;
}) {
  return <FilePreviewFallback kind={kind} message={message} />;
}

export function FilePreviewLoading({ message }: { message: string }) {
  return <FilePreviewFallback message={message} />;
}

export function FilePreviewEmbeddedBody({
  contentClassName,
  kind,
  file,
  isLoading,
  hasFailed,
  children,
}: {
  contentClassName: string;
  kind: FilePreviewMediaKind;
  file: File | undefined;
  isLoading: boolean;
  hasFailed: boolean;
  children: ReactNode;
}) {
  const messages = getFilePreviewMessages(kind);

  if (!file) {
    return (
      <FilePreviewUnavailable kind={kind} message={messages.missingFile} />
    );
  }

  if (hasFailed) {
    return <FilePreviewUnavailable kind={kind} message={messages.failed} />;
  }

  return (
    <div className={contentClassName}>
      {isLoading ? <FilePreviewLoading message={messages.loading} /> : null}
      {children}
    </div>
  );
}
