export const FILE_PREVIEW_KIND = {
  PDF: "pdf",
  DOCX: "docx",
  MP4: "mp4",
  MP3: "mp3",
  UNKNOWN: "unknown",
} as const;

export type FilePreviewKind =
  (typeof FILE_PREVIEW_KIND)[keyof typeof FILE_PREVIEW_KIND];

export type BaseAttachment = {
  id: string;
  name: string;
  kind: FilePreviewKind;
  sizeBytes?: number;
  mimeType?: string;
};

export type ComposerAttachment = BaseAttachment;

export type LibraryRecentFile = BaseAttachment & {
  lastUsedLabel?: string;
};
