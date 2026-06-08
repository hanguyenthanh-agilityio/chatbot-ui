import DOMPurify from "dompurify";

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

/** DOCX → HTML for column-3 preview (sanitized before render). */
export async function convertDocxFileToHtml(file: File): Promise<string> {
  const mammoth = await loadMammoth();
  const arrayBuffer = await file.arrayBuffer();
  const { value } = await mammoth.convertToHtml(
    { arrayBuffer },
    { externalFileAccess: false },
  );
  return sanitizeDocxPreviewHtml(value);
}

/** DOCX → plain text for attach-time read (AI/RAG; separate from HTML preview). */
export async function extractDocxFileText(file: File): Promise<string> {
  const mammoth = await loadMammoth();
  const arrayBuffer = await file.arrayBuffer();
  const { value } = await mammoth.extractRawText({ arrayBuffer });
  const text = value.trim();
  if (!text) {
    throw new Error("File is empty");
  }
  return text;
}

/** Chrome/Edge PDF viewer: hide thumbnail sidebar; keep toolbar (page, zoom, download). */
const PDF_PREVIEW_EMBED_FRAGMENT = "navpanes=0&view=FitH";

export function withPdfEmbedParams(dataUrl: string) {
  const base = dataUrl.split("#", 1)[0];
  return `${base}#${PDF_PREVIEW_EMBED_FRAGMENT}`;
}

/** CSV/JSON → text for column-3 code preview (also reused by attach-time read). */
export async function readCodePreviewFile(
  file: File,
  kind: "csv" | "json",
): Promise<string> {
  const text = (await file.text())
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();
  if (!text.trim()) {
    throw new Error("File is empty");
  }

  if (kind === "json") {
    return JSON.stringify(JSON.parse(text), null, 2);
  }

  return text;
}
