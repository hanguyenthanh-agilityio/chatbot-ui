import type { UIMessage } from "ai";
import type { RefObject } from "react";
import { EMPTY_CHAT_HINT } from "@/constants/chat-ui";
import { LoadingBubble } from "@/components/chat/loading-bubble";
import { MessageBubble } from "@/components/chat/message-bubble";
import { Text } from "@/components/ui/text";

type ChatMessagesProps = {
  containerRef: RefObject<HTMLElement | null>;
  messages: UIMessage[];
  isSubmitting: boolean;
  isStreaming: boolean;
};

export function ChatMessages({
  containerRef,
  messages,
  isSubmitting,
  isStreaming,
}: ChatMessagesProps) {
  const lastMessage = messages.at(-1);
  const showLoadingBubble = isSubmitting && lastMessage?.role === "user";

  return (
    <section
      ref={containerRef}
      className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      {messages.length === 0 ? (
        <Text variant="muted">{EMPTY_CHAT_HINT}</Text>
      ) : (
        messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            showStreamingCursor={
              isStreaming &&
              message.role === "assistant" &&
              message.id === lastMessage?.id
            }
          />
        ))
      )}
      {showLoadingBubble ? <LoadingBubble /> : null}
    </section>
  );
}
