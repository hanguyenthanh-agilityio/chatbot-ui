"use client";

import { FILE_ATTACHMENT_CONTENT_COPY } from "@/constants/file-attachment";
import {
  FILE_PREVIEW_CODE_KINDS,
  FILE_PREVIEW_KIND,
  type AttachmentContentReader,
  type CodeFilePreviewKind,
  type FilePreviewKind,
  type ReadableAttachmentKind,
} from "@/types/file-attachment";
import {
  assertNonEmptyTrimmed,
  extractDocxFileText,
  readCodePreviewFile,
} from "@/utils/file-preview";

type PdfParseModule = typeof import("pdf-parse");

let pdfParseModule: PdfParseModule | null = null;

/** pdf-parse must load at runtime — static import breaks Next/Worker bundles. */
async function loadPdfParse() {
  if (!pdfParseModule) {
    pdfParseModule = await import("pdf-parse");
  }
  return pdfParseModule;
}

/** PDF → plain text via pdf-parse (browser only). */
async function extractPdfFileText(file: File): Promise<string> {
  const { PDFParse } = await loadPdfParse();
  const parser = new PDFParse({ data: await file.arrayBuffer() });
  try {
    const result = await parser.getText();
    return assertNonEmptyTrimmed(result.text);
  } finally {
    await parser.destroy();
  }
}

const CODE_ATTACHMENT_READERS = Object.fromEntries(
  FILE_PREVIEW_CODE_KINDS.map((kind) => [
    kind,
    (file: File) => readCodePreviewFile(file, kind),
  ]),
) as Record<CodeFilePreviewKind, AttachmentContentReader>;

/** One reader per kind — add new extractors here. */
const ATTACHMENT_CONTENT_READERS: Partial<
  Record<FilePreviewKind, AttachmentContentReader>
> = {
  [FILE_PREVIEW_KIND.PDF]: extractPdfFileText,
  [FILE_PREVIEW_KIND.DOCX]: extractDocxFileText,
  ...CODE_ATTACHMENT_READERS,
};

export function isReadableAttachmentKind(
  kind: FilePreviewKind,
): kind is ReadableAttachmentKind {
  return ATTACHMENT_CONTENT_READERS[kind] != null;
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
    throw new Error(FILE_ATTACHMENT_CONTENT_COPY.unsupportedKind(kind));
  }
  return reader(file);
}
