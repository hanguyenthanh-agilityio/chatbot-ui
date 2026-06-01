import { FILE_PREVIEW_KIND, type FilePreviewKind } from "@/types/file-attachment";

const EXTENSION_KIND: Record<string, FilePreviewKind> = {
  pdf: FILE_PREVIEW_KIND.PDF,
  docx: FILE_PREVIEW_KIND.DOCX,
  mp4: FILE_PREVIEW_KIND.MP4,
  mp3: FILE_PREVIEW_KIND.MP3,
};

const MIME_KIND: Record<string, FilePreviewKind> = {
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

export function createAttachmentId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}`;
}
