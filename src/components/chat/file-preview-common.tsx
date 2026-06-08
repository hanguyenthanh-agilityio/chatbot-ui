"use client";

import type { ReactNode } from "react";
import { FileKindIcon } from "@/components/chat/file-kind-icon";
import { Text } from "@/components/ui/text";
import {
  FILE_PREVIEW_CODE_CONTENT_CLASS,
  FILE_PREVIEW_FALLBACK_CLASS,
  getFilePreviewMessages,
  type FilePreviewMediaKind,
} from "@/constants/file-attachment";
import { useCodeFilePreview } from "@/hooks/use-file-preview";
import type {
  CodeFilePreviewKind,
  FilePreviewKind,
} from "@/types/file-attachment";

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
      {isLoading ? <FilePreviewFallback message={messages.loading} /> : null}
      {children}
    </div>
  );
}

function FilePreviewCodeBody({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <div className="file-preview-code">
      <div className="file-preview-code-scroll">
        <div className="file-preview-code-gutter" aria-hidden>
          {lines.map((_, index) => (
            <div key={index} className="file-preview-code-line-number">
              {index + 1}
            </div>
          ))}
        </div>
        <pre className="file-preview-code-body">
          <code>{text}</code>
        </pre>
      </div>
    </div>
  );
}

export function FilePreviewCodeFile({
  file,
  kind,
}: {
  file: File | undefined;
  kind: CodeFilePreviewKind;
}) {
  const { text, isLoading, hasFailed } = useCodeFilePreview(file, kind);

  return (
    <FilePreviewEmbeddedBody
      contentClassName={FILE_PREVIEW_CODE_CONTENT_CLASS}
      kind={kind}
      file={file}
      isLoading={isLoading}
      hasFailed={hasFailed}
    >
      {text ? <FilePreviewCodeBody text={text} /> : null}
    </FilePreviewEmbeddedBody>
  );
}
