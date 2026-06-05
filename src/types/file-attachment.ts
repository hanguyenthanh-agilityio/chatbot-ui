export const FILE_PREVIEW_KIND = {
  IMAGE: "image",
  PDF: "pdf",
  DOCX: "docx",
  MP4: "mp4",
  MP3: "mp3",
  CSV: "csv",
  JSON: "json",
  UNKNOWN: "unknown",
} as const;

export type FilePreviewKind =
  (typeof FILE_PREVIEW_KIND)[keyof typeof FILE_PREVIEW_KIND];

export const ATTACHMENT_CONTENT_READ_STATUS = {
  /** Text extraction in progress after attach. */
  PENDING: "pending",
  /** Plain text available on `content`. */
  READY: "ready",
  /** Extraction failed (corrupt/empty file). */
  FAILED: "failed",
  /** Kind has no text reader yet (image, mp3, mp4). */
  UNSUPPORTED: "unsupported",
} as const;

export type AttachmentContentReadStatus =
  (typeof ATTACHMENT_CONTENT_READ_STATUS)[keyof typeof ATTACHMENT_CONTENT_READ_STATUS];

export type BaseAttachment = {
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
  /**
   * Plain text extracted on attach for AI/RAG chunking.
   * Not rendered in preview UI — see useComposerAttachment + file-content utils.
   */
  content?: string;
  contentReadStatus?: AttachmentContentReadStatus;
};

export type ComposerAttachment = BaseAttachment;

export type LibraryRecentFile = BaseAttachment & {
  lastUsedLabel?: string;
};
