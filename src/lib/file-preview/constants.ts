export const FILE_PREVIEW_ACCEPT =
  ".pdf,.docx,.mp4,.mp3,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,video/mp4,audio/mpeg,audio/mp3";

export const FILE_PREVIEW_COPY = {
  attachMenuLabel: "Add attachment",
  attachMenuAriaLabel: "Open attachment menu",
  addFilesLabel: "Add photos & files",
  recentFilesLabel: "Recent files",
  recentFilesComingSoon: "Coming soon",
  removeAttachmentLabel: (name: string) => `Remove ${name}`,
} as const;

/** Static labels for the Recent files submenu (UI only; not wired yet). */
export const MOCK_RECENT_FILES = [
  { id: "recent-policy-2026", name: "leave-policy-2026.pdf" },
  { id: "recent-onboarding", name: "onboarding-walkthrough.mp4" },
  { id: "recent-handbook", name: "employee-handbook.docx" },
] as const;
