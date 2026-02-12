"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { FormEvent, useEffect, useRef, useState } from "react";

const CHAT_TITLE = "Simple AI Chatbot";
const CHAT_SUBTITLE = "Built with Next.js + AI SDK + OpenAI";
const CHAT_PLACEHOLDER = "Say something...";

type MessageBubbleProps = {
  message: UIMessage;
  showStreamingCursor?: boolean;
};

function getTextParts(message: UIMessage) {
  return message.parts.flatMap((part) =>
    part.type === "text" ? [part.text] : [],
  );
}

function MessageBubble({
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
        <p className="whitespace-pre-wrap leading-relaxed text-slate-500">
          Working on your response...
        </p>
      ) : (
        textParts.map((textPart, index) => (
          <p
            key={`${message.id}-${index}`}
            className="whitespace-pre-wrap leading-relaxed"
          >
            {textPart}
          </p>
        ))
      )}
      {showStreamingCursor ? (
        <span className="ml-1 inline-block h-4 w-2 animate-pulse rounded-sm bg-slate-400 align-middle" />
      ) : null}
    </article>
  );
}

function LoadingBubble() {
  return (
    <article className="mr-auto flex max-w-[90%] items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600">
      <span>Assistant is thinking</span>
      <span className="inline-flex items-center gap-1">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:120ms]" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:240ms]" />
      </span>
    </article>
  );
}

export default function Home() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error } = useChat();
  const messagesContainerRef = useRef<HTMLElement>(null);

  const isSubmitting = status === "submitted";
  const isStreaming = status === "streaming";
  const isLoading = isSubmitting || isStreaming;
  const trimmedInput = input.trim();
  const canSend = trimmedInput.length > 0 && !isLoading;
  const lastMessage = messages.at(-1);
  const showLoadingBubble = isSubmitting && lastMessage?.role === "user";

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: isStreaming ? "auto" : "smooth",
    });
  }, [messages, isStreaming]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!trimmedInput) return;
    sendMessage({ text: trimmedInput });
    setInput("");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 p-4 sm:p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">{CHAT_TITLE}</h1>
        <p className="text-sm text-slate-600">{CHAT_SUBTITLE}</p>
      </header>

      <section
        ref={messagesContainerRef}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        {messages.length === 0 ? (
          <p className="text-sm text-slate-500">
            Ask something to start the chat.
          </p>
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

      {isSubmitting ? (
        <p className="text-xs text-slate-500" aria-live="polite">
          Sending message...
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={CHAT_PLACEHOLDER}
          aria-label="Chat input"
          className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900"
        />
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send message"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isLoading ? "Generating..." : "Send"}
        </button>
      </form>

      {error ? (
        <p className="text-sm text-red-700">Error: {error.message}</p>
      ) : null}
    </main>
  );
}
