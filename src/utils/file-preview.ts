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

export const CSV_PREVIEW_MAX_ROWS = 500;

export type CsvPreviewTable = {
  headers: string[];
  rows: Record<string, string>[];
  truncated: boolean;
};

/** Parse one CSV record line (RFC 4180-style quotes and escaped quotes). */
export function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current);
  return cells;
}

export function parseCsvText(text: string): CsvPreviewTable {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    throw new Error("CSV file is empty");
  }

  const headers = parseCsvLine(lines[0]!);
  if (headers.length === 0) {
    throw new Error("CSV header row is empty");
  }

  const dataLines = lines.slice(1);
  const limitedLines = dataLines.slice(0, CSV_PREVIEW_MAX_ROWS);
  const rows = limitedLines.map((line) => {
    const cells = parseCsvLine(line);
    return headers.reduce<Record<string, string>>((row, header, cellIndex) => {
      row[header] = cells[cellIndex] ?? "";
      return row;
    }, {});
  });

  return {
    headers,
    rows,
    truncated: dataLines.length > CSV_PREVIEW_MAX_ROWS,
  };
}

/** Read and parse a local JSON file for column-3 preview (client-only). */
export async function parseJsonFile(file: File): Promise<string> {
  const text = await file.text();
  if (!text.trim()) {
    throw new Error("JSON file is empty");
  }

  const parsed: unknown = JSON.parse(text);
  return JSON.stringify(parsed, null, 2);
}

/** Read a local CSV file as plain text for column-3 code preview (client-only). */
export async function readCsvFileText(file: File): Promise<string> {
  const text = await file.text();
  if (!text.trim()) {
    throw new Error("CSV file is empty");
  }

  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}
