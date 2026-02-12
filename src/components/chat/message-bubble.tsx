import type { UIMessage } from "ai";
import { Text } from "@/components/ui/text";
import { STREAMING_PLACEHOLDER_TEXT } from "@/constants/chat-ui";
import { getTextParts } from "@/utils/chat-message";

type MessageBubbleProps = {
  message: UIMessage;
  showStreamingCursor?: boolean;
};

export function MessageBubble({
  message,
  showStreamingCursor = false,
}: MessageBubbleProps) {
  const isUserMessage = message.role === "user";
  const textParts = getTextParts(message);

  const bubbleClassName = isUserMessage
    ? "ml-auto max-w-[90%] rounded-lg bg-slate-900 px-3 py-2 text-sm text-white"
    : "mr-auto max-w-[90%] rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-900";

  return (
    <article className={bubbleClassName}>
      {textParts.length === 0 && !isUserMessage ? (
        <Text variant="muted" className="whitespace-pre-wrap leading-relaxed">
          {STREAMING_PLACEHOLDER_TEXT}
        </Text>
      ) : (
        textParts.map((textPart, index) => (
          <Text
            key={`${message.id}-${index}`}
            variant="inherit"
            className="whitespace-pre-wrap leading-relaxed"
          >
            {textPart}
          </Text>
        ))
      )}
      {showStreamingCursor ? (
        <span className="ml-1 inline-block h-4 w-2 animate-pulse rounded-sm bg-slate-400 align-middle" />
      ) : null}
    </article>
  );
}
