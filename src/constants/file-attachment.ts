import { FILE_PREVIEW_KIND } from "@/types/file-attachment";
import type {
  FilePreviewKind,
  LibraryRecentFile,
} from "@/types/file-attachment";
import { cn } from "@/utils/class-name";

export const FILE_KIND_LABEL: Record<FilePreviewKind, string> = {
  [FILE_PREVIEW_KIND.IMAGE]: "IMAGE",
  [FILE_PREVIEW_KIND.PDF]: "PDF",
  [FILE_PREVIEW_KIND.DOCX]: "DOCX",
  [FILE_PREVIEW_KIND.MP4]: "MP4",
  [FILE_PREVIEW_KIND.MP3]: "MP3",
  [FILE_PREVIEW_KIND.UNKNOWN]: "FILE",
};

export const FILE_KIND_BG: Record<FilePreviewKind, string> = {
  [FILE_PREVIEW_KIND.IMAGE]: "bg-amber-500",
  [FILE_PREVIEW_KIND.PDF]: "bg-red-500",
  [FILE_PREVIEW_KIND.DOCX]: "bg-blue-500",
  [FILE_PREVIEW_KIND.MP4]: "bg-violet-500",
  [FILE_PREVIEW_KIND.MP3]: "bg-teal-500",
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

export const COMPOSER_ATTACH_TOGGLE_BUTTON_CLASS = cn(
  "flex h-8 w-8 min-h-8 min-w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border p-0 leading-none transition-colors duration-200",
  "border-white/12 bg-white/6 text-white/80 hover:border-violet-400/45 hover:bg-white/10",
  "disabled:cursor-not-allowed disabled:opacity-40",
  "light:border-app-border light:bg-app-surface-subtle light:text-app-fg-muted light:hover:border-app-border-emphasis light:hover:bg-app-hover",
  "[&_svg]:block [&_svg]:shrink-0",
);

export const COMPOSER_ATTACH_TOGGLE_ICON_CLASS = "h-3.5 w-3.5";

export const COMPOSER_ATTACH_CHIP_REMOVE_CLASS = cn(
  "grid h-7 w-7 min-w-7 shrink-0 cursor-pointer place-items-center rounded-lg p-0 text-white/50 transition-colors",
  "hover:bg-white/10 hover:text-white/90",
  "disabled:cursor-not-allowed disabled:opacity-40",
  "light:text-app-fg-faint light:hover:bg-app-hover light:hover:text-app-fg",
);

export const COMPOSER_ATTACH_MENU_CLASS = cn(
  "absolute bottom-full left-0 z-120 mb-2 min-w-[15.5rem] overflow-visible p-1.5",
);

/** Recent-files flyout layout (portal positioning). */
export const RECENT_FLYOUT_LAYOUT = {
  width: 280,
  maxHeight: 320,
  gap: 6,
  viewportPadding: 8,
  hoverCloseDelayMs: 120,
} as const;

export const FILE_PREVIEW_ACCEPT =
  ".png,.jpg,.jpeg,.gif,.webp,.pdf,.docx,.mp4,.mp3,image/png,image/jpeg,image/gif,image/webp,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,video/mp4,audio/mpeg,audio/mp3";

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
  imagePreviewUnavailable: "Image preview is not available.",
} as const;

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
