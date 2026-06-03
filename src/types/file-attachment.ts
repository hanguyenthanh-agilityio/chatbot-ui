export const FILE_PREVIEW_KIND = {
  IMAGE: "image",
  PDF: "pdf",
  DOCX: "docx",
  MP4: "mp4",
  MP3: "mp3",
  UNKNOWN: "unknown",
} as const;

export type FilePreviewKind =
  (typeof FILE_PREVIEW_KIND)[keyof typeof FILE_PREVIEW_KIND];

export type ComposerAttachment = {
  id: string;
  name: string;
  kind: FilePreviewKind;
  sizeBytes?: number;
  mimeType?: string;
  /**
   * Keep the original File so preview UIs can create an object URL.
   * (Client-only; never sent to the server.)
   */
  rawFile?: File;
};

export type LibraryRecentFile = {
  id: string;
  name: string;
  kind: FilePreviewKind;
  sizeBytes?: number;
  mimeType?: string;
  lastUsedLabel?: string;
};
