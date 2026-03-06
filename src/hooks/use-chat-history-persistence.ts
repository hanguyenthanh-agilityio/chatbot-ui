"use client";

import type { UIMessage } from "ai";
import { useCallback, useEffect, useRef } from "react";
import type { AIProviderName } from "@/lib/ai-provider";

const CHAT_HISTORY_STORAGE_KEY = "ai-sdk-chat-history-by-provider-v1";

type SetMessages = (
  messages: UIMessage[] | ((messages: UIMessage[]) => UIMessage[]),
) => void;

type PersistedChatHistories = Partial<Record<AIProviderName, UIMessage[]>>;

function isPersistableMessage(value: unknown): value is UIMessage {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<UIMessage>;

  return (
    typeof candidate.id === "string" &&
    (candidate.role === "user" ||
      candidate.role === "assistant" ||
      candidate.role === "system") &&
    Array.isArray(candidate.parts)
  );
}

function loadPersistedHistories(): PersistedChatHistories {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};

    const histories = parsed as Record<string, unknown>;

    return (["openai", "ollama"] as const).reduce<PersistedChatHistories>(
      (acc, provider) => {
        const providerMessages = histories[provider];
        if (Array.isArray(providerMessages)) {
          acc[provider] = providerMessages.filter(isPersistableMessage);
        }
        return acc;
      },
      {},
    );
  } catch {
    return {};
  }
}

function persistHistories(histories: PersistedChatHistories) {
  if (typeof window === "undefined") {
    return;
  }

  const hasAnyHistory = Object.values(histories).some(
    (providerMessages) =>
      Array.isArray(providerMessages) && providerMessages.length > 0,
  );

  if (!hasAnyHistory) {
    window.localStorage.removeItem(CHAT_HISTORY_STORAGE_KEY);
    return;
  }

  try {
    window.localStorage.setItem(
      CHAT_HISTORY_STORAGE_KEY,
      JSON.stringify(histories),
    );
  } catch {
    // Ignore storage quota errors (e.g. when message history includes large files).
  }
}

function loadPersistedMessagesForProvider(
  provider: AIProviderName,
): UIMessage[] {
  const histories = loadPersistedHistories();
  return histories[provider] ?? [];
}

function persistMessagesForProvider(
  provider: AIProviderName,
  messages: UIMessage[],
) {
  const histories = loadPersistedHistories();

  if (messages.length === 0) {
    delete histories[provider];
  } else {
    histories[provider] = messages;
  }

  persistHistories(histories);
}

export function useChatHistoryPersistence(
  messages: UIMessage[],
  setMessages: SetMessages,
  provider: AIProviderName,
) {
  const skipNextPersistRef = useRef(true);

  useEffect(() => {
    // Restore provider-specific chat state when provider changes.
    const persistedMessages = loadPersistedMessagesForProvider(provider);
    skipNextPersistRef.current = true;
    setMessages(persistedMessages);
  }, [provider, setMessages]);

  useEffect(() => {
    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false;
      return;
    }

    persistMessagesForProvider(provider, messages);
  }, [messages, provider]);

  const clearHistory = useCallback(() => {
    persistMessagesForProvider(provider, []);
    setMessages([]);
  }, [provider, setMessages]);

  return {
    clearHistory,
  };
}
