"use client";

import type { UIMessage } from "ai";
import { useCallback, useEffect, useRef } from "react";

const CHAT_HISTORY_STORAGE_KEY = "ai-sdk-chat-history-v1";

type SetMessages = (
  messages: UIMessage[] | ((messages: UIMessage[]) => UIMessage[]),
) => void;

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

function loadPersistedMessages(): UIMessage[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isPersistableMessage);
  } catch {
    return [];
  }
}

function persistMessages(messages: UIMessage[]) {
  if (typeof window === "undefined") {
    return;
  }

  if (messages.length === 0) {
    window.localStorage.removeItem(CHAT_HISTORY_STORAGE_KEY);
    return;
  }

  try {
    window.localStorage.setItem(
      CHAT_HISTORY_STORAGE_KEY,
      JSON.stringify(messages),
    );
  } catch {
    // Ignore storage quota errors (e.g. when message history includes large files).
  }
}

export function useChatHistoryPersistence(
  messages: UIMessage[],
  setMessages: SetMessages,
) {
  const skipNextPersistRef = useRef(true);

  useEffect(() => {
    const persistedMessages = loadPersistedMessages();

    if (persistedMessages.length > 0) {
      // Restore chat state from localStorage on first client mount.
      setMessages(persistedMessages);
    }
  }, [setMessages]);

  useEffect(() => {
    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false;
      return;
    }

    persistMessages(messages);
  }, [messages]);

  const clearHistory = useCallback(() => {
    persistMessages([]);
    setMessages([]);
  }, [setMessages]);

  return {
    clearHistory,
  };
}
