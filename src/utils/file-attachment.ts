import { FILE_PREVIEW_PANEL_WIDTH, RECENT_FLYOUT_LAYOUT } from "@/constants/file-attachment";
import {
  FILE_PREVIEW_KIND,
  type FilePreviewKind,
  type LibraryRecentFile,
} from "@/types/file-attachment";
import type { CSSProperties } from "react";

const EXTENSION_KIND: Record<string, FilePreviewKind> = {
  png: FILE_PREVIEW_KIND.IMAGE,
  jpg: FILE_PREVIEW_KIND.IMAGE,
  jpeg: FILE_PREVIEW_KIND.IMAGE,
  gif: FILE_PREVIEW_KIND.IMAGE,
  webp: FILE_PREVIEW_KIND.IMAGE,
  pdf: FILE_PREVIEW_KIND.PDF,
  docx: FILE_PREVIEW_KIND.DOCX,
  mp4: FILE_PREVIEW_KIND.MP4,
  mp3: FILE_PREVIEW_KIND.MP3,
};

const MIME_KIND: Record<string, FilePreviewKind> = {
  "image/png": FILE_PREVIEW_KIND.IMAGE,
  "image/jpeg": FILE_PREVIEW_KIND.IMAGE,
  "image/gif": FILE_PREVIEW_KIND.IMAGE,
  "image/webp": FILE_PREVIEW_KIND.IMAGE,
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

export function clampFilePreviewPanelWidth(
  width: number,
  viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1280,
) {
  // Cap max width so chat column keeps usable space on smaller desktops.
  const max = Math.min(
    FILE_PREVIEW_PANEL_WIDTH.max,
    Math.floor(viewportWidth * FILE_PREVIEW_PANEL_WIDTH.viewportMaxRatio),
  );

  return Math.min(max, Math.max(FILE_PREVIEW_PANEL_WIDTH.min, Math.round(width)));
}

/** Pointer-drag resize for column 3. Updates grid via --workspace-col-3-width in WorkspaceApp (not Tailwind resize). */
export function bindFilePreviewPanelResize({
  startX,
  startWidth,
  onWidthChange,
  onActiveChange,
}: {
  startX: number;
  startWidth: number;
  onWidthChange: (width: number) => void;
  onActiveChange: (active: boolean) => void;
}) {
  const handlePointerMove = (event: PointerEvent) => {
    // Dragging left edge left → wider preview column.
    onWidthChange(
      clampFilePreviewPanelWidth(startWidth + (startX - event.clientX), window.innerWidth),
    );
  };

  const handlePointerUp = () => {
    onActiveChange(false);
    document.body.style.removeProperty("cursor");
    document.body.style.removeProperty("user-select");
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  };

  onActiveChange(true);
  document.body.style.cursor = "col-resize";
  document.body.style.userSelect = "none";
  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", handlePointerUp);
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
