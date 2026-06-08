"use client";

import type { ReactNode } from "react";
import { FileKindIcon } from "@/components/chat/file-kind-icon";
import { Text } from "@/components/ui/text";
import {
  FILE_PREVIEW_CODE_CONTENT_CLASS,
  FILE_PREVIEW_FALLBACK_CLASS,
  FILE_PREVIEW_FRAME_CLASS,
  getFilePreviewMessages,
} from "@/constants/file-attachment";
import {
  useCodeFilePreview,
  useDataUrlPreviewState,
} from "@/hooks/use-file-preview";
import type {
  CodeFilePreviewKind,
  FilePreviewKind,
  FilePreviewMediaKind,
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
  contentClassName = "",
  kind,
  file,
  isLoading,
  hasFailed,
  children,
}: {
  contentClassName?: string;
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
      {isLoading ? (
        <FilePreviewFallback message={messages.loading} />
      ) : (
        children
      )}
    </div>
  );
}

export function FilePreviewFramedDataUrl({
  kind,
  file,
  children,
}: {
  kind: FilePreviewMediaKind;
  file: File | undefined;
  children: (props: { url: string; onRenderError: () => void }) => ReactNode;
}) {
  const { url, isLoading, failed, handleRenderError } =
    useDataUrlPreviewState(file);

  return (
    <FilePreviewEmbeddedBody
      kind={kind}
      file={file}
      isLoading={isLoading}
      hasFailed={failed}
    >
      {url ? (
        <div className={FILE_PREVIEW_FRAME_CLASS}>
          {children({ url, onRenderError: handleRenderError })}
        </div>
      ) : null}
    </FilePreviewEmbeddedBody>
  );
}

export function FilePreviewAsyncEmbeddedBody({
  contentClassName,
  kind,
  file,
  isLoading,
  hasFailed,
  value,
  children,
}: {
  contentClassName?: string;
  kind: FilePreviewMediaKind;
  file: File | undefined;
  isLoading: boolean;
  hasFailed: boolean;
  value: unknown;
  children: ReactNode;
}) {
  return (
    <FilePreviewEmbeddedBody
      contentClassName={contentClassName}
      kind={kind}
      file={file}
      isLoading={isLoading}
      hasFailed={hasFailed}
    >
      {value ? children : null}
    </FilePreviewEmbeddedBody>
  );
}

function FilePreviewCodeBody({ text }: { text: string }) {
  const normalized = text.trim();
  const lines = normalized.split("\n");

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
          <code>{normalized}</code>
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
    <FilePreviewAsyncEmbeddedBody
      contentClassName={FILE_PREVIEW_CODE_CONTENT_CLASS}
      kind={kind}
      file={file}
      isLoading={isLoading}
      hasFailed={hasFailed}
      value={text}
    >
      <FilePreviewCodeBody text={text!} />
    </FilePreviewAsyncEmbeddedBody>
  );
}
