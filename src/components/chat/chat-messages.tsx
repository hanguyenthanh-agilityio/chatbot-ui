import type { UIMessage } from "ai";
import type { RefObject } from "react";
import { EMPTY_CHAT_HINT } from "@/constants/chat-ui";
import { LoadingBubble } from "@/components/chat/loading-bubble";
import { MessageBubble } from "@/components/chat/message-bubble";
import { Text } from "@/components/ui/text";

export type ChatRequestFailure = {
  id: string;
  message: string;
  messageId?: string;
  retriedCount: number;
};

type ChatMessagesProps = {
  containerRef: RefObject<HTMLElement | null>;
  messages: UIMessage[];
  isSubmitting: boolean;
  isStreaming: boolean;
  requestFailures: ChatRequestFailure[];
  retryingFailureId?: string | null;
  onRetryFailure: (failureId: string) => void;
};

export function ChatMessages({
  containerRef,
  messages,
  isSubmitting,
  isStreaming,
  requestFailures,
  retryingFailureId,
  onRetryFailure,
}: ChatMessagesProps) {
  const lastMessage = messages.at(-1);
  const showLoadingBubble = isSubmitting && lastMessage?.role === "user";

  return (
    <section
      ref={containerRef}
      className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overflow-x-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
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

      {requestFailures.map((failure) => (
        <article
          key={failure.id}
          className="mr-auto max-w-[90%] break-words rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900"
        >
          <div className="flex items-start gap-2">
            <button
              type="button"
              aria-label="Retry failed request"
              title="Retry failed request"
              className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-red-200 bg-white text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={
                !failure.messageId || Boolean(retryingFailureId === failure.id)
              }
              onClick={() => onRetryFailure(failure.id)}
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 2v6h-6" />
                <path d="M3 22v-6h6" />
                <path d="M3.5 10a8.5 8.5 0 0 1 14.6-3L21 10" />
                <path d="M20.5 14a8.5 8.5 0 0 1-14.6 3L3 14" />
              </svg>
            </button>

            <div className="min-w-0">
              <Text
                variant="inherit"
                className="whitespace-pre-wrap leading-relaxed"
              >
                {failure.message}
              </Text>
              {failure.retriedCount > 0 ? (
                <Text variant="caption" className="mt-1 text-red-700">
                  Retried {failure.retriedCount} time
                  {failure.retriedCount > 1 ? "s" : ""}.
                </Text>
              ) : null}
            </div>
          </div>
        </article>
      ))}

      {showLoadingBubble ? <LoadingBubble /> : null}
    </section>
  );
}
