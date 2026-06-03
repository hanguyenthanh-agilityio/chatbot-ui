import type { ChangeEvent } from "react";
import { RECENT_FLYOUT_LAYOUT } from "@/constants/file-attachment";
import {
  FILE_PREVIEW_KIND,
  type FilePreviewKind,
  type LibraryRecentFile,
} from "@/types/file-attachment";
import type { CSSProperties } from "react";

const EXTENSION_KIND: Record<string, FilePreviewKind> = {
  pdf: FILE_PREVIEW_KIND.PDF,
  docx: FILE_PREVIEW_KIND.DOCX,
  mp4: FILE_PREVIEW_KIND.MP4,
  mp3: FILE_PREVIEW_KIND.MP3,
};

const MIME_KIND: Record<string, FilePreviewKind> = {
  "application/pdf": FILE_PREVIEW_KIND.PDF,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    FILE_PREVIEW_KIND.DOCX,
  "video/mp4": FILE_PREVIEW_KIND.MP4,
  "audio/mpeg": FILE_PREVIEW_KIND.MP3,
  "audio/mp3": FILE_PREVIEW_KIND.MP3,
};

export function inferFilePreviewKind(file: File): FilePreviewKind {
  const mimeKind = MIME_KIND[file.type];
  if (mimeKind) return mimeKind;

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_KIND[extension] ?? FILE_PREVIEW_KIND.UNKNOWN;
}

export function isSupportedPreviewKind(kind: FilePreviewKind): boolean {
  return kind !== FILE_PREVIEW_KIND.UNKNOWN;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatLibraryFileMeta(file: LibraryRecentFile) {
  const parts: string[] = [];
  if (file.sizeBytes != null) parts.push(formatFileSize(file.sizeBytes));
  if (file.lastUsedLabel) parts.push(file.lastUsedLabel);
  return parts.join(" · ");
}

export function createAttachmentId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}`;
}

/** Read the first picked file and reset the input so the same file can be selected again. */
export function readSelectedFileFromInput(
  event: ChangeEvent<HTMLInputElement>,
): File | undefined {
  const file = event.target.files?.[0];
  event.target.value = "";
  return file;
}

export function getRecentFlyoutPosition(
  recentRow: HTMLElement,
  menuPanel: HTMLElement | null,
): CSSProperties {
  const { width, maxHeight, gap, viewportPadding } = RECENT_FLYOUT_LAYOUT;
  const rowRect = recentRow.getBoundingClientRect();
  const menuRect = menuPanel?.getBoundingClientRect();

  let left = (menuRect?.right ?? rowRect.right) + gap;
  if (left + width > window.innerWidth - viewportPadding) {
    left = (menuRect?.left ?? rowRect.left) - width - gap;
  }

  let top = menuRect?.top ?? rowRect.top;
  if (top + maxHeight > window.innerHeight - viewportPadding) {
    top = Math.max(
      viewportPadding,
      window.innerHeight - maxHeight - viewportPadding,
    );
  }

  return { top, left };
}
