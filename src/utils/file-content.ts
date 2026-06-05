import { PDFParse } from "pdf-parse";
import {
  FILE_PREVIEW_KIND,
  type FilePreviewKind,
} from "@/types/file-attachment";
import {
  extractDocxFileText,
  readCodePreviewFile,
} from "@/utils/file-preview";

/** Kinds we can turn into plain text for AI/RAG (not preview UI). */
const READABLE_ATTACHMENT_KINDS = new Set<FilePreviewKind>([
  FILE_PREVIEW_KIND.PDF,
  FILE_PREVIEW_KIND.DOCX,
  FILE_PREVIEW_KIND.CSV,
  FILE_PREVIEW_KIND.JSON,
]);

type AttachmentContentReader = (file: File) => Promise<string>;

/** One reader per kind — add new extractors here. */
const ATTACHMENT_CONTENT_READERS: Partial<
  Record<FilePreviewKind, AttachmentContentReader>
> = {
  [FILE_PREVIEW_KIND.PDF]: extractPdfFileText,
  [FILE_PREVIEW_KIND.DOCX]: extractDocxFileText,
  [FILE_PREVIEW_KIND.CSV]: (file) => readCodePreviewFile(file, "csv"),
  [FILE_PREVIEW_KIND.JSON]: (file) => readCodePreviewFile(file, "json"),
};

export function isReadableAttachmentKind(kind: FilePreviewKind): boolean {
  return READABLE_ATTACHMENT_KINDS.has(kind);
}

function trimNonEmpty(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("File is empty");
  }
  return trimmed;
}

/** PDF → plain text via pdf-parse (browser-safe build). */
async function extractPdfFileText(file: File): Promise<string> {
  const parser = new PDFParse({ data: await file.arrayBuffer() });
  try {
    const result = await parser.getText();
    return trimNonEmpty(result.text);
  } finally {
    await parser.destroy();
  }
}

/**
 * Read attachment text on the client after the user picks a file.
 * Result is stored on ComposerAttachment.content (not shown in UI).
 */
export async function readAttachmentContent(
  file: File,
  kind: FilePreviewKind,
): Promise<string> {
  const reader = ATTACHMENT_CONTENT_READERS[kind];
  if (!reader) {
    throw new Error(`Unsupported attachment kind: ${kind}`);
  }
  return reader(file);
}
