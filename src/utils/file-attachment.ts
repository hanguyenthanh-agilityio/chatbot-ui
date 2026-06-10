import type { ChangeEvent, CSSProperties } from "react";
import {
  FILE_PREVIEW_KIND_MAPS,
  FILE_PREVIEW_PANEL_WIDTH,
  RECENT_FLYOUT_LAYOUT,
} from "@/constants/file-attachment";
import {
  FILE_PREVIEW_KIND,
  type FilePreviewKind,
  type LibraryRecentFile,
} from "@/types/file-attachment";

const FALLBACK_VIEWPORT = {
  width: 1280,
  height: 720,
} as const;

function getViewportWidth(): number {
  return typeof window !== "undefined"
    ? window.innerWidth
    : FALLBACK_VIEWPORT.width;
}

function getViewportHeight(): number {
  return typeof window !== "undefined"
    ? window.innerHeight
    : FALLBACK_VIEWPORT.height;
}

export function inferFilePreviewKind(file: File): FilePreviewKind {
  const mimeKind = FILE_PREVIEW_KIND_MAPS.mimeKind[file.type];
  if (mimeKind) return mimeKind;

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return (
    FILE_PREVIEW_KIND_MAPS.extensionKind[extension] ?? FILE_PREVIEW_KIND.UNKNOWN
  );
}

export function isSupportedPreviewKind(kind: FilePreviewKind): boolean {
  return kind !== FILE_PREVIEW_KIND.UNKNOWN;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatLibraryFileMeta(file: LibraryRecentFile): string {
  const parts: string[] = [];
  if (file.sizeBytes != null) parts.push(formatFileSize(file.sizeBytes));
  if (file.lastUsedLabel) parts.push(file.lastUsedLabel);
  return parts.join(" · ");
}

export function createAttachmentId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}`;
}

export function clampFilePreviewPanelWidth(
  width: number,
  viewportWidth = getViewportWidth(),
): number {
  // Cap max width so chat column keeps usable space on smaller desktops.
  const max = Math.min(
    FILE_PREVIEW_PANEL_WIDTH.max,
    Math.floor(viewportWidth * FILE_PREVIEW_PANEL_WIDTH.viewportMaxRatio),
  );

  return Math.min(
    max,
    Math.max(FILE_PREVIEW_PANEL_WIDTH.min, Math.round(width)),
  );
}

/** Pointer-drag resize for column 3. Updates grid via --workspace-col-3-width in WorkspaceApp (not Tailwind resize). */
export function bindFilePreviewPanelResize({
  handle,
  pointerId,
  startX,
  startWidth,
  onWidthChange,
  onActiveChange,
}: {
  handle: HTMLElement;
  pointerId: number;
  startX: number;
  startWidth: number;
  onWidthChange: (width: number) => void;
  onActiveChange: (active: boolean) => void;
}): void {
  const handlePointerMove = (event: PointerEvent) => {
    if (event.pointerId !== pointerId) return;
    // Dragging left edge left → wider preview column.
    onWidthChange(
      clampFilePreviewPanelWidth(
        startWidth + (startX - event.clientX),
        getViewportWidth(),
      ),
    );
  };

  const endResize = (event: PointerEvent) => {
    if (event.pointerId !== pointerId) return;
    onActiveChange(false);
    document.body.style.removeProperty("cursor");
    document.body.style.removeProperty("user-select");
    handle.removeEventListener("pointermove", handlePointerMove);
    handle.removeEventListener("pointerup", endResize);
    handle.removeEventListener("pointercancel", endResize);
    if (handle.hasPointerCapture(pointerId)) {
      handle.releasePointerCapture(pointerId);
    }
  };

  onActiveChange(true);
  document.body.style.cursor = "col-resize";
  document.body.style.userSelect = "none";
  handle.setPointerCapture(pointerId);
  handle.addEventListener("pointermove", handlePointerMove);
  handle.addEventListener("pointerup", endResize);
  handle.addEventListener("pointercancel", endResize);
}

/** Read the first picked file and reset the input so the same file can be selected again. */
export function readSelectedFileFromInput(
  event: ChangeEvent<HTMLInputElement>,
): File | undefined {
  const file = event.target.files?.[0];
  event.target.value = "";
  return file;
}

/** Fixed flyout position from menu/row rects; safe when `window` is undefined (SSR). */
export function getRecentFlyoutPosition(
  recentRow: HTMLElement,
  menuPanel: HTMLElement | null,
): CSSProperties {
  const { width, maxHeight, gap, viewportPadding } = RECENT_FLYOUT_LAYOUT;
  const rowRect = recentRow.getBoundingClientRect();
  const menuRect = menuPanel?.getBoundingClientRect();
  const viewportWidth = getViewportWidth();
  const viewportHeight = getViewportHeight();

  let left = (menuRect?.right ?? rowRect.right) + gap;
  if (left + width > viewportWidth - viewportPadding) {
    left = (menuRect?.left ?? rowRect.left) - width - gap;
  }

  let top = menuRect?.top ?? rowRect.top;
  if (top + maxHeight > viewportHeight - viewportPadding) {
    top = Math.max(
      viewportPadding,
      viewportHeight - maxHeight - viewportPadding,
    );
  }

  return { top, left };
}
