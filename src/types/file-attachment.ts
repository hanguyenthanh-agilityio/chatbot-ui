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

export type SupportedFilePreviewKind = Exclude<
  FilePreviewKind,
  typeof FILE_PREVIEW_KIND.UNKNOWN
>;

/** Kinds rendered by `FilePreviewEmbeddedBody` (loading/failed/missing copy). */
export type FilePreviewMediaKind = SupportedFilePreviewKind;

export const FILE_PREVIEW_CODE_KINDS = [
  FILE_PREVIEW_KIND.CSV,
  FILE_PREVIEW_KIND.JSON,
] as const;

export type CodeFilePreviewKind = (typeof FILE_PREVIEW_CODE_KINDS)[number];

/** Kinds with attach-time plain-text extraction (PDF, DOCX, CSV, JSON). */
export const READABLE_ATTACHMENT_KINDS = [
  FILE_PREVIEW_KIND.PDF,
  FILE_PREVIEW_KIND.DOCX,
  ...FILE_PREVIEW_CODE_KINDS,
] as const;

export type ReadableAttachmentKind =
  (typeof READABLE_ATTACHMENT_KINDS)[number];

export type AttachmentContentReader = (file: File) => Promise<string>;

export type FilePreviewFailedAction = "load" | "convert";

export type RawFilePreviewProps = {
  file: File | undefined;
};

export type NamedRawFilePreviewProps = RawFilePreviewProps & {
  name: string;
};

export type MediaFilePreviewKind =
  | typeof FILE_PREVIEW_KIND.MP4
  | typeof FILE_PREVIEW_KIND.MP3;

export type FilePreviewTypeDefinition = {
  kind: SupportedFilePreviewKind;
  extensions: readonly string[];
  mimeTypes: readonly string[];
};

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
};

export type ComposerAttachment = BaseAttachment;

export type LibraryRecentFile = BaseAttachment & {
  lastUsedLabel?: string;
};
