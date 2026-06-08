import DOMPurify from "dompurify";
import {
  FILE_ATTACHMENT_CONTENT_COPY,
  FILE_PREVIEW_CODE_PARSE,
  FILE_PREVIEW_PDF_EMBED,
} from "@/constants/file-attachment";
import {
  FILE_PREVIEW_KIND,
  type CodeFilePreviewKind,
} from "@/types/file-attachment";

type MammothModule = typeof import("mammoth");

let mammothModule: MammothModule | null = null;

async function loadMammoth() {
  if (!mammothModule) {
    mammothModule = await import("mammoth");
  }
  return mammothModule;
}

async function readDocxWithMammoth(file: File) {
  const mammoth = await loadMammoth();
  const arrayBuffer = await file.arrayBuffer();
  return { mammoth, arrayBuffer };
}

function normalizeCodePreviewText(text: string): string {
  const { lineEnding } = FILE_PREVIEW_CODE_PARSE;
  return text.replace(/\r\n/g, lineEnding).replace(/\r/g, lineEnding);
}

export function assertNonEmptyTrimmed(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error(FILE_ATTACHMENT_CONTENT_COPY.emptyFile);
  }
  return trimmed;
}

/** Mammoth emits HTML fragments; sanitize before any `dangerouslySetInnerHTML`. */
export function sanitizeDocxPreviewHtml(html: string): string {
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}

/** Convert a local DOCX file to HTML for the right-rail preview panel (client-only). */
export async function convertDocxFileToHtml(file: File): Promise<string> {
  const { mammoth, arrayBuffer } = await readDocxWithMammoth(file);
  const { value } = await mammoth.convertToHtml(
    { arrayBuffer },
    { externalFileAccess: false },
  );
  return sanitizeDocxPreviewHtml(value);
}

/** DOCX → plain text for attach-time read (AI/RAG; separate from HTML preview). */
export async function extractDocxFileText(file: File): Promise<string> {
  const { mammoth, arrayBuffer } = await readDocxWithMammoth(file);
  const { value } = await mammoth.extractRawText({ arrayBuffer });
  return assertNonEmptyTrimmed(value);
}

export function withPdfEmbedParams(dataUrl: string) {
  const base = dataUrl.split("#", 1)[0];
  return `${base}#${FILE_PREVIEW_PDF_EMBED.fragment}`;
}

/** Read local CSV/JSON text for preview and attach-time content extraction (client-only). */
export async function readCodePreviewFile(
  file: File,
  kind: CodeFilePreviewKind,
): Promise<string> {
  const text = normalizeCodePreviewText(await file.text());
  if (!text.trim()) {
    throw new Error(FILE_ATTACHMENT_CONTENT_COPY.emptyFile);
  }

  if (kind === FILE_PREVIEW_KIND.JSON) {
    return JSON.stringify(
      JSON.parse(text),
      null,
      FILE_PREVIEW_CODE_PARSE.jsonIndent,
    );
  }

  return text;
}
