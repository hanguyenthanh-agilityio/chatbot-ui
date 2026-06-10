import {
  FILE_PREVIEW_CODE_KINDS,
  FILE_PREVIEW_KIND,
  type FilePreviewFailedAction,
  type FilePreviewKind,
  type FilePreviewMediaKind,
  type FilePreviewTypeDefinition,
  type LibraryRecentFile,
} from "@/types/file-attachment";
import { cn } from "@/utils/class-name";

export const COMPOSER_ATTACHMENT_ID_PREFIX = "attach";

/** Attach-time content extraction (not preview UI). */
export const FILE_ATTACHMENT_CONTENT_COPY = {
  emptyFile: "File is empty",
  invalidJson: "Invalid JSON file",
  unsupportedKind: (kind: string) => `Unsupported attachment kind: ${kind}`,
} as const;

/** CSV/JSON code preview parsing. */
export const FILE_PREVIEW_CODE_PARSE = {
  jsonIndent: 2,
  lineEnding: "\n",
} as const;

/** Chrome/Edge PDF viewer embed params (hide thumbnail sidebar). */
export const FILE_PREVIEW_PDF_EMBED = {
  fragment: "navpanes=0&view=FitH",
} as const;

const FILE_KIND_META: Record<
  FilePreviewMediaKind,
  {
    badgeLabel: string;
    messageLabel: string;
    failedAction: FilePreviewFailedAction;
  }
> = {
  [FILE_PREVIEW_KIND.IMAGE]: {
    badgeLabel: "IMAGE",
    messageLabel: "image",
    failedAction: "load",
  },
  [FILE_PREVIEW_KIND.PDF]: {
    badgeLabel: "PDF",
    messageLabel: "PDF",
    failedAction: "load",
  },
  [FILE_PREVIEW_KIND.DOCX]: {
    badgeLabel: "DOCX",
    messageLabel: "document",
    failedAction: "convert",
  },
  [FILE_PREVIEW_KIND.MP4]: {
    badgeLabel: "MP4",
    messageLabel: "video",
    failedAction: "load",
  },
  [FILE_PREVIEW_KIND.MP3]: {
    badgeLabel: "MP3",
    messageLabel: "audio",
    failedAction: "load",
  },
  [FILE_PREVIEW_KIND.CSV]: {
    badgeLabel: "CSV",
    messageLabel: "CSV",
    failedAction: "load",
  },
  [FILE_PREVIEW_KIND.JSON]: {
    badgeLabel: "JSON",
    messageLabel: "JSON",
    failedAction: "load",
  },
};

/** Badge text for chips and lists — backed by FILE_KIND_META. */
export function getFileKindLabel(kind: FilePreviewKind): string {
  if (kind === FILE_PREVIEW_KIND.UNKNOWN) return "FILE";
  return FILE_KIND_META[kind].badgeLabel;
}

export const FILE_KIND_BG: Record<FilePreviewKind, string> = {
  [FILE_PREVIEW_KIND.IMAGE]: "bg-amber-500",
  [FILE_PREVIEW_KIND.PDF]: "bg-red-500",
  [FILE_PREVIEW_KIND.DOCX]: "bg-blue-500",
  [FILE_PREVIEW_KIND.MP4]: "bg-violet-500",
  [FILE_PREVIEW_KIND.MP3]: "bg-teal-500",
  [FILE_PREVIEW_KIND.CSV]: "bg-emerald-500",
  [FILE_PREVIEW_KIND.JSON]: "bg-orange-500",
  [FILE_PREVIEW_KIND.UNKNOWN]: "bg-neutral-500",
};

export const COMPOSER_ATTACH_MENU_PANEL_CLASS = cn(
  "rounded-2xl border shadow-panel backdrop-blur-xl",
  "border-white/12 bg-slate-900/95",
  "light:border-app-border light:bg-app-surface-raised light:shadow-panel-sm",
);

export const COMPOSER_ATTACH_MENU_ITEM_CLASS = cn(
  "flex h-auto w-full items-center justify-start gap-3 rounded-xl px-2.5 py-2 text-left font-normal transition-colors",
  "bg-transparent text-white/90 hover:bg-white/8",
  "light:text-app-fg light:hover:bg-app-hover",
);

export const COMPOSER_ATTACH_MENU_ITEM_LABEL_CLASS =
  "min-w-0 flex-1 text-sm font-medium leading-snug text-inherit";

/** Square icon sizes (height === width). */
export const COMPOSER_ATTACH_ICON_XS_CLASS = "h-3.5 w-3.5";
export const COMPOSER_ATTACH_ICON_LG_CLASS = "h-[18px] w-[18px]";
export const COMPOSER_ATTACH_ICON_BOX_TOGGLE_CLASS = "h-8 w-8 min-h-8 min-w-8";
export const COMPOSER_ATTACH_ICON_BOX_CHIP_REMOVE_CLASS = "h-7 w-7 min-w-7";

export const COMPOSER_ATTACH_TOGGLE_BUTTON_CLASS = cn(
  "flex shrink-0 cursor-pointer items-center justify-center rounded-lg border p-0 leading-none transition-colors duration-200",
  COMPOSER_ATTACH_ICON_BOX_TOGGLE_CLASS,
  "border-white/12 bg-white/6 text-white/80 hover:border-violet-400/45 hover:bg-white/10",
  "disabled:cursor-not-allowed disabled:opacity-40",
  "light:border-app-border light:bg-app-surface-subtle light:text-app-fg-muted light:hover:border-app-border-emphasis light:hover:bg-app-hover",
  "[&_svg]:block [&_svg]:shrink-0",
);

export const COMPOSER_ATTACH_CHIP_REMOVE_CLASS = cn(
  "grid shrink-0 cursor-pointer place-items-center rounded-lg p-0 text-white/50 transition-colors",
  COMPOSER_ATTACH_ICON_BOX_CHIP_REMOVE_CLASS,
  "hover:bg-white/10 hover:text-white/90",
  "disabled:cursor-not-allowed disabled:opacity-40",
  "light:text-app-fg-faint light:hover:bg-app-hover light:hover:text-app-fg",
);

export const COMPOSER_ATTACH_MENU_CLASS = cn(
  "absolute bottom-full left-0 z-120 mb-2 min-w-[15.5rem] overflow-visible p-1.5",
);

/** Right-rail file preview panel (column 3). Styles live here; resize logic in utils/file-attachment. */
export const FILE_PREVIEW_PANEL_CLASS = cn(
  "flex h-full min-h-preview w-full min-w-0 flex-col overflow-hidden rounded-shell border shadow-shell",
  "bg-glass-panel backdrop-blur-shell",
  "border-white/9 text-white light:border-app-border-muted light:text-app-fg",
);

export const FILE_PREVIEW_FRAME_CLASS = cn(
  "rounded-2xl border p-1 sm:p-1.5",
  "border-white/8 bg-white/2 light:border-app-border-subtle light:bg-app-surface-subtle",
);

export const FILE_PREVIEW_FALLBACK_CLASS = cn(
  FILE_PREVIEW_FRAME_CLASS,
  "flex min-h-preview flex-col items-center justify-center gap-3 px-6 py-10 text-center",
);

export const FILE_PREVIEW_SCROLL_CLASS = "file-preview-thin-scroll";

export const FILE_PREVIEW_EMBEDDED_KINDS = new Set<FilePreviewKind>([
  FILE_PREVIEW_KIND.DOCX,
  FILE_PREVIEW_KIND.PDF,
  ...FILE_PREVIEW_CODE_KINDS,
]);

export function isFilePreviewEmbeddedKind(kind: FilePreviewKind) {
  return FILE_PREVIEW_EMBEDDED_KINDS.has(kind);
}

const FILE_PREVIEW_CONTENT_HOST_LAYOUT_CLASS = cn(
  FILE_PREVIEW_SCROLL_CLASS,
  "relative flex min-h-0 min-w-0 max-w-full flex-1 flex-col",
);

const FILE_PREVIEW_EMBEDDED_BORDER_CLASS =
  "rounded-2xl border border-white/8 light:border-app-border-subtle";

const FILE_PREVIEW_EMBEDDED_SHELL_CLASS = cn(
  FILE_PREVIEW_CONTENT_HOST_LAYOUT_CLASS,
  FILE_PREVIEW_EMBEDDED_BORDER_CLASS,
  "bg-white",
);

/** Scrollable DOCX preview host (mammoth HTML in `.file-preview-docx-html`). */
export const FILE_PREVIEW_DOCX_CONTENT_CLASS = cn(
  "file-preview-docx-content",
  FILE_PREVIEW_EMBEDDED_SHELL_CLASS,
  "overflow-y-auto overflow-x-hidden",
);

/** PDF preview host (iframe with data URL). */
export const FILE_PREVIEW_PDF_CONTENT_CLASS = cn(
  "file-preview-pdf-content",
  FILE_PREVIEW_EMBEDDED_SHELL_CLASS,
  "overflow-hidden",
);

/** Host for scrollable CSV/JSON preview (theme tokens in globals.css). */
export const FILE_PREVIEW_CODE_CONTENT_CLASS = cn(
  "file-preview-code-content",
  FILE_PREVIEW_CONTENT_HOST_LAYOUT_CLASS,
  FILE_PREVIEW_EMBEDDED_BORDER_CLASS,
  "overflow-auto",
);

/** Desktop-only drag handle between chat and preview. Sits outside the panel; height inset matches rounded-shell corners. */
export const FILE_PREVIEW_RESIZE_HANDLE_CLASS = cn(
  "group/resize absolute top-[var(--radius-shell)] bottom-[var(--radius-shell)] left-0 z-20 hidden w-4 -translate-x-1/2 cursor-col-resize touch-none lg:flex lg:items-center lg:justify-center",
  "before:absolute before:inset-y-0 before:left-1/2 before:w-px before:-translate-x-1/2 before:rounded-full before:transition-colors before:duration-200",
  "before:bg-white/6 group-hover/resize:before:bg-white/18 data-[resizing=true]:before:bg-violet-400/65",
  "light:before:bg-app-border-subtle light:group-hover/resize:before:bg-app-border light:data-[resizing=true]:before:bg-app-fg-faint",
);

export const FILE_PREVIEW_RESIZE_GRIP_CLASS = cn(
  "relative z-10 flex flex-col gap-1 rounded-full border px-1.5 py-2 transition-all duration-200",
  "border-white/14 bg-white/8 text-white/55 opacity-100 shadow-sm",
  "group-hover/resize:border-white/22 group-hover/resize:bg-white/12 group-hover/resize:text-white/80 group-hover/resize:shadow-md",
  "group-data-[resizing=true]/resize:border-violet-400/55 group-data-[resizing=true]/resize:bg-white/14 group-data-[resizing=true]/resize:text-white group-data-[resizing=true]/resize:shadow-md",
  "light:border-app-border light:bg-white light:text-app-fg-faint light:shadow-panel-sm",
  "light:group-hover/resize:border-app-border-emphasis light:group-hover/resize:bg-white light:group-hover/resize:text-app-fg-muted light:group-hover/resize:shadow-panel",
  "light:group-data-[resizing=true]/resize:border-app-border-emphasis light:group-data-[resizing=true]/resize:bg-app-surface-subtle light:group-data-[resizing=true]/resize:text-app-fg",
);

export const FILE_PREVIEW_RESIZE_GRIP_DOT_CLASS = cn(
  "h-1 w-1 rounded-full bg-current opacity-70 transition-opacity duration-200",
  "group-hover/resize:opacity-90 group-data-[resizing=true]/resize:opacity-100",
);

/** Recent-files flyout layout (portal positioning). */
export const RECENT_FLYOUT_LAYOUT = {
  width: 280,
  maxHeight: 320,
  gap: 6,
  viewportPadding: 8,
  hoverCloseDelayMs: 120,
} as const;

/** Resizable file preview panel width (px); CSS tokens in globals.css. */
export const FILE_PREVIEW_PANEL_WIDTH = {
  default: 288,
  min: 240,
  max: 560,
  viewportMaxRatio: 0.45,
} as const;

/** Single source of truth for supported upload/preview file types. */
export const FILE_PREVIEW_TYPE_DEFINITIONS = [
  {
    kind: FILE_PREVIEW_KIND.IMAGE,
    extensions: ["png", "jpg", "jpeg", "gif", "webp"],
    mimeTypes: ["image/png", "image/jpeg", "image/gif", "image/webp"],
  },
  {
    kind: FILE_PREVIEW_KIND.PDF,
    extensions: ["pdf"],
    mimeTypes: ["application/pdf"],
  },
  {
    kind: FILE_PREVIEW_KIND.DOCX,
    extensions: ["docx"],
    mimeTypes: [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },
  {
    kind: FILE_PREVIEW_KIND.MP4,
    extensions: ["mp4"],
    mimeTypes: ["video/mp4"],
  },
  {
    kind: FILE_PREVIEW_KIND.MP3,
    extensions: ["mp3"],
    mimeTypes: ["audio/mpeg", "audio/mp3"],
  },
  {
    kind: FILE_PREVIEW_KIND.CSV,
    extensions: ["csv"],
    mimeTypes: ["text/csv", "application/csv"],
  },
  {
    kind: FILE_PREVIEW_KIND.JSON,
    extensions: ["json"],
    mimeTypes: ["application/json", "text/json"],
  },
] as const satisfies readonly FilePreviewTypeDefinition[];

function buildFilePreviewAccept(
  definitions: readonly FilePreviewTypeDefinition[],
) {
  const parts: string[] = [];
  for (const { extensions, mimeTypes } of definitions) {
    for (const extension of extensions) {
      parts.push(`.${extension}`);
    }
    parts.push(...mimeTypes);
  }
  return parts.join(",");
}

export const FILE_PREVIEW_ACCEPT = buildFilePreviewAccept(
  FILE_PREVIEW_TYPE_DEFINITIONS,
);

export function buildFilePreviewKindMaps(
  definitions: readonly FilePreviewTypeDefinition[],
) {
  const extensionKind: Record<string, FilePreviewKind> = {};
  const mimeKind: Record<string, FilePreviewKind> = {};

  for (const { kind, extensions, mimeTypes } of definitions) {
    for (const extension of extensions) {
      extensionKind[extension] = kind;
    }
    for (const mimeType of mimeTypes) {
      mimeKind[mimeType] = kind;
    }
  }

  return { extensionKind, mimeKind };
}

export const FILE_PREVIEW_KIND_MAPS = buildFilePreviewKindMaps(
  FILE_PREVIEW_TYPE_DEFINITIONS,
);

export const FILE_PREVIEW_COPY = {
  attachMenuLabel: "Add attachment",
  attachMenuAriaLabel: "Open attachment menu",
  addFilesLabel: "Add photos & files",
  recentFilesLabel: "Recent files",
  recentFilesEmpty: "No recent files",
  recentFilesComingSoon: "Coming soon",
  recentFilesComingSoonHint: "Preview only — not available yet",
  removeAttachmentLabel: (name: string) => `Remove ${name}`,
  closePreviewLabel: "Close preview",
  openAttachmentPreviewLabel: (name: string) => `Preview ${name}`,
  previewNoFile: "No file selected for preview.",
  previewUnavailable: "Preview is not available for this file type.",
  previewLoading: (fileTypeLabel: string) =>
    `Loading ${fileTypeLabel} preview…`,
  previewFailed: (fileTypeLabel: string) =>
    `Could not load this ${fileTypeLabel} for preview.`,
  previewConvertFailed: (fileTypeLabel: string) =>
    `Could not convert this ${fileTypeLabel} for preview.`,
  resizePreviewLabel: "Resize file preview panel",
  panelTitle: "File preview",
  panelAriaLabel: "File preview",
} as const;

export function getFilePreviewMessages(kind: FilePreviewMediaKind) {
  const { messageLabel, failedAction } = FILE_KIND_META[kind];

  return {
    missingFile: FILE_PREVIEW_COPY.previewNoFile,
    loading: FILE_PREVIEW_COPY.previewLoading(messageLabel),
    failed:
      failedAction === "convert"
        ? FILE_PREVIEW_COPY.previewConvertFailed(messageLabel)
        : FILE_PREVIEW_COPY.previewFailed(messageLabel),
  };
}

export const MOCK_RECENT_FILES: readonly LibraryRecentFile[] = [
  {
    id: "recent-policy-2026",
    name: "leave-policy-2026.pdf",
    kind: FILE_PREVIEW_KIND.PDF,
    sizeBytes: 245_760,
    lastUsedLabel: "Yesterday",
  },
  {
    id: "recent-onboarding",
    name: "onboarding-walkthrough.mp4",
    kind: FILE_PREVIEW_KIND.MP4,
    sizeBytes: 12_582_912,
    lastUsedLabel: "Last week",
  },
  {
    id: "recent-handbook",
    name: "employee-handbook.docx",
    kind: FILE_PREVIEW_KIND.DOCX,
    sizeBytes: 1_048_576,
    lastUsedLabel: "Mar 12",
  },
] as const;
