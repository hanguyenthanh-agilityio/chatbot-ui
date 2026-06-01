import { FILE_PREVIEW_KIND } from "@/lib/file-preview/types";
import type { LibraryRecentFile } from "@/lib/file-preview/types";

export const FILE_PREVIEW_ACCEPT =
  ".pdf,.docx,.mp4,.mp3,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,video/mp4,audio/mpeg,audio/mp3";

export const FILE_PREVIEW_COPY = {
  attachMenuLabel: "Add attachment",
  attachMenuAriaLabel: "Open attachment menu",
  addFilesLabel: "Add photos & files",
  recentFilesLabel: "Recent files",
  recentFilesEmpty: "No recent files",
  recentFilesComingSoon: "Coming soon",
  recentFilesComingSoonHint: "Preview only — not available yet",
  removeAttachmentLabel: (name: string) => `Remove ${name}`,
} as const;

/** Mock recent files for composer UI (not wired to Library yet). */
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
