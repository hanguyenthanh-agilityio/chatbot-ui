import type { FileUIPart, UIMessage } from "ai";

const MAX_FILE_TEXT_CHARS = 12_000;

function toSnippet(text: string): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= MAX_FILE_TEXT_CHARS) {
    return normalized;
  }

  return `${normalized.slice(0, MAX_FILE_TEXT_CHARS)}\n[...truncated...]`;
}

function parseDataUrl(dataUrl: string): {
  mediaType: string;
  bytes: Uint8Array;
} | null {
  const match = dataUrl.match(/^data:([^;,]+);base64,([\s\S]+)$/);

  if (!match) {
    return null;
  }

  const [, mediaType, base64Payload] = match;

  try {
    return {
      mediaType,
      bytes: Uint8Array.from(Buffer.from(base64Payload, "base64")),
    };
  } catch {
    return null;
  }
}

function decodeTextBytes(bytes: Uint8Array): string {
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const pdfParseModule = await import("pdf-parse");
  const parsePdf = (
    "default" in pdfParseModule ? pdfParseModule.default : pdfParseModule
  ) as (buffer: Buffer) => Promise<{ text: string }>;

  const result = await parsePdf(Buffer.from(bytes));
  return result.text ?? "";
}

async function extractDocxText(bytes: Uint8Array): Promise<string> {
  const mammothModule = await import("mammoth");

  const result = await mammothModule.extractRawText({
    buffer: Buffer.from(bytes),
  });

  return result.value ?? "";
}

async function extractDocumentText(part: FileUIPart): Promise<string | null> {
  if (!part.url.startsWith("data:")) {
    return null;
  }

  const parsed = parseDataUrl(part.url);
  if (!parsed) {
    return null;
  }

  const mediaType = (part.mediaType || parsed.mediaType).toLowerCase();

  try {
    if (mediaType.startsWith("text/")) {
      return toSnippet(decodeTextBytes(parsed.bytes));
    }

    if (
      mediaType === "application/json" ||
      mediaType === "application/xml" ||
      mediaType === "text/markdown" ||
      mediaType === "text/csv"
    ) {
      return toSnippet(decodeTextBytes(parsed.bytes));
    }

    if (mediaType === "application/pdf") {
      return toSnippet(await extractPdfText(parsed.bytes));
    }

    if (
      mediaType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      part.filename?.toLowerCase().endsWith(".docx")
    ) {
      return toSnippet(await extractDocxText(parsed.bytes));
    }
  } catch {
    return null;
  }

  return null;
}

function filePartToTextNotice(part: FileUIPart, text: string | null): string {
  const filename = part.filename ?? "uploaded-file";

  if (text && text.length > 0) {
    return `[Attached file: ${filename}]\n${text}`;
  }

  return `[Attached file: ${filename}]\nThis file type cannot be parsed automatically. Please ask user to provide plain text summary if needed.`;
}

function isFilePart(part: UIMessage["parts"][number]): part is FileUIPart {
  return part.type === "file";
}

export function hasImageFileAttachment(messages: UIMessage[]): boolean {
  return messages.some((message) =>
    message.parts.some(
      (part) => isFilePart(part) && part.mediaType.startsWith("image/"),
    ),
  );
}

export async function normalizeMessagesForFileAttachments(
  messages: UIMessage[],
): Promise<UIMessage[]> {
  const normalizedMessages: UIMessage[] = [];

  for (const message of messages) {
    const normalizedParts: UIMessage["parts"] = [];

    for (const part of message.parts) {
      if (!isFilePart(part)) {
        normalizedParts.push(part);
        continue;
      }

      if (part.mediaType.startsWith("image/")) {
        // Keep image parts unchanged so vision-capable models can consume them.
        normalizedParts.push(part);
        continue;
      }

      const extractedText = await extractDocumentText(part);

      normalizedParts.push({
        type: "text",
        text: filePartToTextNotice(part, extractedText),
      });
    }

    normalizedMessages.push({
      ...message,
      parts: normalizedParts,
    });
  }

  return normalizedMessages;
}
