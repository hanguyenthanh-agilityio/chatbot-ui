import Image from "next/image";
import { isToolUIPart, type FileUIPart, type UIMessage } from "ai";
import { Text } from "@/components/ui/text";
import { STREAMING_PLACEHOLDER_TEXT } from "@/constants/chat-ui";
import { getTextParts } from "@/utils/chat-message";

type MessageBubbleProps = {
  message: UIMessage;
  showStreamingCursor?: boolean;
};

function formatUnknown(value: unknown): string {
  if (typeof value === "string") return value;

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function getToolName(part: UIMessage["parts"][number]) {
  if (!isToolUIPart(part)) {
    return part.type;
  }

  return part.type === "dynamic-tool"
    ? part.toolName
    : part.type.replace("tool-", "");
}

function truncateText(value: string, maxLength: number): string {
  return value.length > maxLength ? `${value.slice(0, maxLength)}…` : value;
}

function getToolTooltipText(part: UIMessage["parts"][number]): string {
  if (!isToolUIPart(part)) {
    return "";
  }

  const lines: string[] = [
    `Tool: ${getToolName(part)}`,
    `State: ${part.state}`,
  ];

  if (
    part.state === "input-streaming" ||
    part.state === "input-available" ||
    part.state === "approval-requested" ||
    part.state === "approval-responded" ||
    part.state === "output-available" ||
    part.state === "output-error" ||
    part.state === "output-denied"
  ) {
    lines.push(`Input: ${truncateText(formatUnknown(part.input), 600)}`);
  }

  if (part.state === "output-available") {
    lines.push(`Output: ${truncateText(formatUnknown(part.output), 600)}`);
  }

  if (part.state === "output-error") {
    lines.push(`Error: ${part.errorText}`);
  }

  if (part.state === "output-denied") {
    lines.push(`Denied: ${part.approval.reason ?? "No reason provided."}`);
  }

  return lines.join("\n");
}

function isFilePart(part: UIMessage["parts"][number]): part is FileUIPart {
  return part.type === "file";
}

export function MessageBubble({
  message,
  showStreamingCursor = false,
}: MessageBubbleProps) {
  const isUserMessage = message.role === "user";
  const textParts = getTextParts(message);
  const fileParts = message.parts.filter((part) => isFilePart(part));
  const toolParts = message.parts.filter((part) => isToolUIPart(part));
  const latestToolParts = Array.from(
    new Map(
      toolParts.map((part, index) => [
        part.toolCallId ?? `tool-${index}`,
        part,
      ]),
    ).values(),
  );

  const bubbleClassName = isUserMessage
    ? "ml-auto max-w-[90%] break-words rounded-lg bg-slate-900 px-3 py-2 text-sm text-white"
    : "mr-auto max-w-[90%] break-words rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-900";

  return (
    <article className={bubbleClassName}>
      {textParts.length === 0 &&
      toolParts.length === 0 &&
      fileParts.length === 0 &&
      !isUserMessage ? (
        <Text variant="muted" className="whitespace-pre-wrap leading-relaxed">
          {STREAMING_PLACEHOLDER_TEXT}
        </Text>
      ) : null}

      {textParts.map((textPart, index) => (
        <Text
          key={`${message.id}-text-${index}`}
          variant="inherit"
          className="whitespace-pre-wrap leading-relaxed"
        >
          {textPart}
        </Text>
      ))}

      {fileParts.map((part, index) => {
        const filename = part.filename ?? `file-${index + 1}`;
        const isImage = part.mediaType.startsWith("image/");

        return (
          <div
            key={`${message.id}-file-${index}`}
            className="mt-2 rounded-md border border-slate-300/70 bg-white/70 p-2 text-xs text-slate-700"
          >
            <Text
              as="p"
              variant="caption"
              className="font-semibold text-slate-800"
            >
              Attachment: {filename}
            </Text>
            <Text as="p" variant="caption" className="text-slate-600">
              {part.mediaType}
            </Text>

            {isImage ? (
              <Image
                src={part.url}
                alt={filename}
                width={512}
                height={512}
                unoptimized
                className="mt-2 max-h-52 w-full rounded-md border border-slate-200 object-contain"
              />
            ) : null}
          </div>
        );
      })}

      {latestToolParts.length > 0 ? (
        <div className="mt-2 flex flex-wrap items-center gap-1 text-xs">
          <Text
            as="span"
            variant="caption"
            className="font-medium text-slate-700"
          >
            Using tools:
          </Text>

          {latestToolParts.map((part, index) => (
            <span
              key={`${message.id}-${part.toolCallId ?? index}`}
              className="inline-flex items-center"
            >
              <span className="group relative inline-flex">
                <span
                  role="button"
                  tabIndex={0}
                  className="cursor-help rounded border border-slate-300 bg-white/85 px-1.5 py-0.5 text-[11px] font-medium text-slate-700 outline-none ring-slate-400 transition focus-visible:ring-2"
                >
                  {getToolName(part)}
                </span>

                <div className="pointer-events-auto invisible absolute bottom-full left-0 z-30 mb-1 w-80 max-w-[calc(100vw-2rem)] rounded-md border border-slate-700 bg-slate-900/95 p-2 text-[11px] text-slate-100 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <pre className="max-h-64 overflow-y-auto overflow-x-auto whitespace-pre-wrap break-words leading-relaxed">
                    {getToolTooltipText(part)}
                  </pre>
                </div>
              </span>

              {index < latestToolParts.length - 1 ? (
                <span className="mx-1 text-slate-400">,</span>
              ) : null}
            </span>
          ))}
        </div>
      ) : null}

      {showStreamingCursor ? (
        <span className="ml-1 inline-block h-4 w-2 animate-pulse rounded-sm bg-slate-400 align-middle" />
      ) : null}
    </article>
  );
}
