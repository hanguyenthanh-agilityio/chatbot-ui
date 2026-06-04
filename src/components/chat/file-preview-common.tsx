"use client";

import type { ReactNode } from "react";
import { FileKindIcon } from "@/components/chat/file-kind-icon";
import { Text } from "@/components/ui/text";
import { FILE_PREVIEW_FALLBACK_CLASS } from "@/constants/file-attachment";
import type { FilePreviewKind } from "@/types/file-attachment";

export function FilePreviewUnavailable({
  kind,
  message,
}: {
  kind: FilePreviewKind;
  message: string;
}) {
  return (
    <div className={FILE_PREVIEW_FALLBACK_CLASS}>
      <FileKindIcon kind={kind} />
      <Text variant="captionMuted">{message}</Text>
    </div>
  );
}

export function FilePreviewLoading({ message }: { message: string }) {
  return (
    <div className={FILE_PREVIEW_FALLBACK_CLASS}>
      <Text variant="captionMuted">{message}</Text>
    </div>
  );
}

export function FilePreviewEmbeddedBody({
  contentClassName,
  kind,
  file,
  isLoading,
  hasFailed,
  loadingMessage,
  unavailableMessage,
  children,
}: {
  contentClassName: string;
  kind: FilePreviewKind;
  file: File | undefined;
  isLoading: boolean;
  hasFailed: boolean;
  loadingMessage: string;
  unavailableMessage: string;
  children: ReactNode;
}) {
  if (!file || hasFailed) {
    return (
      <FilePreviewUnavailable kind={kind} message={unavailableMessage} />
    );
  }

  return (
    <div className={contentClassName}>
      {isLoading ? <FilePreviewLoading message={loadingMessage} /> : null}
      {children}
    </div>
  );
}
