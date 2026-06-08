import DOMPurify from "dompurify";
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

/** Mammoth emits HTML fragments; sanitize before any `dangerouslySetInnerHTML`. */
export function sanitizeDocxPreviewHtml(html: string): string {
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}

/** Convert a local DOCX file to HTML for column-3 preview (client-only). */
export async function convertDocxFileToHtml(file: File): Promise<string> {
  const mammoth = await loadMammoth();
  const arrayBuffer = await file.arrayBuffer();
  const { value } = await mammoth.convertToHtml(
    { arrayBuffer },
    { externalFileAccess: false },
  );
  return sanitizeDocxPreviewHtml(value);
}

/** Chrome/Edge PDF viewer: hide thumbnail sidebar; keep toolbar (page, zoom, download). */
const PDF_PREVIEW_EMBED_FRAGMENT = "navpanes=0&view=FitH";

export function withPdfEmbedParams(dataUrl: string) {
  const base = dataUrl.split("#", 1)[0];
  return `${base}#${PDF_PREVIEW_EMBED_FRAGMENT}`;
}

const CODE_PREVIEW_EMPTY_FILE_ERROR = "File is empty";
const CODE_PREVIEW_JSON_INDENT = 2;

/** Read local JSON/CSV text for column-3 code preview (client-only). */
export async function readCodePreviewFile(
  file: File,
  kind: CodeFilePreviewKind,
): Promise<string> {
  const text = (await file.text()).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (!text.trim()) {
    throw new Error(CODE_PREVIEW_EMPTY_FILE_ERROR);
  }

  if (kind === FILE_PREVIEW_KIND.JSON) {
    return JSON.stringify(JSON.parse(text), null, CODE_PREVIEW_JSON_INDENT);
  }

  return text;
}
