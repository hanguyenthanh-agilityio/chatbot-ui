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

function escapeCodeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function highlightJson(text: string): string {
  const escaped = escapeCodeHtml(text);

  return escaped.replace(
    /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let className = "file-preview-code-token-number";

      if (/^"/.test(match)) {
        className = /:$/.test(match)
          ? "file-preview-code-token-key"
          : "file-preview-code-token-string";
      } else if (/true|false/.test(match)) {
        className = "file-preview-code-token-boolean";
      } else if (/null/.test(match)) {
        className = "file-preview-code-token-null";
      }

      return `<span class="${className}">${match}</span>`;
    },
  );
}

/** Line-numbered code panel for JSON / CSV preview (styles in globals.css). */
export function FilePreviewCodeBody({
  text,
  highlight = false,
  ariaLabel,
}: {
  text: string;
  highlight?: boolean;
  ariaLabel?: string;
}) {
  const lines = text.split("\n");
  const html = highlight ? highlightJson(text) : escapeCodeHtml(text);

  return (
    <div
      className="file-preview-code"
      role="region"
      aria-label={ariaLabel ?? "File preview"}
    >
      <div className="file-preview-code-scroll">
        <div className="file-preview-code-gutter" aria-hidden>
          {lines.map((_, index) => (
            <div key={index} className="file-preview-code-line-number">
              {index + 1}
            </div>
          ))}
        </div>
        <pre className="file-preview-code-body">
          <code dangerouslySetInnerHTML={{ __html: html }} />
        </pre>
      </div>
    </div>
  );
}
