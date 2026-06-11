"use client";

import { FILE_ATTACHMENT_CONTENT_COPY } from "@/constants/file-attachment";
import {
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
async function loadPdfParse(): Promise<PdfParseModule> {
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

const CODE_ATTACHMENT_READERS = {
  [FILE_PREVIEW_KIND.CSV]: (file: File) =>
    readCodePreviewFile(file, FILE_PREVIEW_KIND.CSV),
  [FILE_PREVIEW_KIND.JSON]: (file: File) =>
    readCodePreviewFile(file, FILE_PREVIEW_KIND.JSON),
} satisfies Record<CodeFilePreviewKind, AttachmentContentReader>;

/** Runtime registry — single source of truth for attach-time text extraction. */
const ATTACHMENT_CONTENT_READERS = {
  [FILE_PREVIEW_KIND.PDF]: extractPdfFileText,
  [FILE_PREVIEW_KIND.DOCX]: extractDocxFileText,
  ...CODE_ATTACHMENT_READERS,
} satisfies Record<ReadableAttachmentKind, AttachmentContentReader>;

export function isReadableAttachmentKind(
  kind: FilePreviewKind,
): kind is ReadableAttachmentKind {
  return kind in ATTACHMENT_CONTENT_READERS;
}

/**
 * Read attachment text on the client after the user picks a file.
 * Result is stored on ComposerAttachment.content (not shown in UI).
 */
export async function readAttachmentContent(
  file: File,
  kind: FilePreviewKind,
): Promise<string> {
  if (!isReadableAttachmentKind(kind)) {
    throw new Error(FILE_ATTACHMENT_CONTENT_COPY.unsupportedKind(kind));
  }

  return ATTACHMENT_CONTENT_READERS[kind](file);
}
