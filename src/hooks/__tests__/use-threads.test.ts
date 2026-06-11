import { act, renderHook } from "@testing-library/react";
import type { UIMessage } from "ai";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CHAT_THREAD_COPY } from "@/constants/chat";
import { CHAT_STORAGE_KEYS } from "@/constants/storage";
import { useChatThreads } from "@/hooks/use-threads";
import {
  mockAssistantTextMessage,
  mockAssistantThinkingMessage,
  mockUserChatMessage,
} from "@/mocks/chat-message";
import type { ChatThread } from "@/types/thread";
import type { AppRole } from "@/lib/auth/session";
import { local } from "@/utils/storage";

function makeThread(
  id: string,
  messages: UIMessage[] = [],
  title: string = CHAT_THREAD_COPY.defaultTitle,
): ChatThread {
  const timestamp = "2026-06-08T00:00:00.000Z";
  return {
    id,
    title,
    preview: CHAT_THREAD_COPY.emptyPreview,
    createdAt: timestamp,
    updatedAt: timestamp,
    provider: "ollama",
    messages,
  };
}

function seedRoleThreads(
  role: AppRole,
  threads: ChatThread[],
  activeId: string,
) {
  const otherRole = role === "user" ? "manager" : "user";
  const otherDefault = makeThread(`${otherRole}-default`);

  local.write(
    CHAT_STORAGE_KEYS.threadsByRole,
    JSON.stringify({
      user:
        role === "user"
          ? { threads, activeId }
          : { threads: [otherDefault], activeId: otherDefault.id },
      manager:
        role === "manager"
          ? { threads, activeId }
          : { threads: [otherDefault], activeId: otherDefault.id },
    }),
  );
}

type ChatThreadHookProps = {
  messages: UIMessage[];
  role: AppRole;
};

function renderChatThreads(initial: Partial<ChatThreadHookProps> = {}) {
  const setMessages = vi.fn();
  const initialProps: ChatThreadHookProps = {
    messages: initial.messages ?? [],
    role: initial.role ?? "user",
  };

  const hook = renderHook(
    ({ messages, role }: ChatThreadHookProps) =>
      useChatThreads({
        messages,
        setMessages,
        provider: "ollama",
        role,
      }),
    { initialProps },
  );

  return { ...hook, setMessages };
}

describe("useChatThreads", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("starts with a default thread and persists storage", () => {
    const { result } = renderChatThreads();

    expect(result.current.allThreads).toHaveLength(1);
    expect(result.current.activeThread.title).toBe(
      CHAT_THREAD_COPY.defaultTitle,
    );
    expect(local.read(CHAT_STORAGE_KEYS.threadsByRole)).toContain('"user"');
  });

  it("syncs incoming messages into the active thread", () => {
    const messages = [
      mockUserChatMessage("Request time off"),
      mockAssistantTextMessage("I can help with that"),
    ];
    const { result, rerender } = renderChatThreads();

    rerender({ messages, role: "user" });

    expect(result.current.activeThread.messages).toEqual(messages);
    expect(result.current.activeThread.title).toBe("Request time off");
    expect(result.current.activeThread.preview).toBe("I can help with that");
  });

  it("createNewThread prepends an empty thread and clears chat messages", () => {
    const { result, setMessages } = renderChatThreads();
    const previousId = result.current.activeThread.id;

    act(() => {
      result.current.createNewThread();
    });

    expect(result.current.allThreads).toHaveLength(2);
    expect(result.current.activeThread.id).not.toBe(previousId);
    expect(result.current.activeThread.messages).toEqual([]);
    expect(setMessages).toHaveBeenCalledWith([]);
  });

  it("switchThread activates another thread and loads its messages", () => {
    const first = makeThread(
      "thread-a",
      [mockUserChatMessage("First")],
      "First",
    );
    const second = makeThread(
      "thread-b",
      [mockUserChatMessage("Second")],
      "Second",
    );
    seedRoleThreads("user", [first, second], "thread-a");

    const { result, setMessages } = renderChatThreads();

    act(() => {
      result.current.switchThread("thread-b");
    });

    expect(result.current.activeThread.id).toBe("thread-b");
    expect(setMessages).toHaveBeenCalledWith(second.messages);
  });

  it("deleteThread removes threads and keeps a usable active thread", () => {
    const first = makeThread(
      "thread-a",
      [mockUserChatMessage("First")],
      "First",
    );
    const second = makeThread(
      "thread-b",
      [mockUserChatMessage("Second")],
      "Second",
    );
    seedRoleThreads("user", [first, second], "thread-a");

    const { result, setMessages } = renderChatThreads();

    act(() => {
      result.current.deleteThread("thread-a");
    });

    expect(result.current.allThreads).toHaveLength(1);
    expect(result.current.activeThread.id).toBe("thread-b");
    expect(setMessages).toHaveBeenCalledWith(second.messages);

    act(() => {
      result.current.deleteThread("thread-b");
    });

    expect(result.current.allThreads).toHaveLength(1);
    expect(result.current.activeThread.id).not.toBe("thread-b");
    expect(result.current.activeThread.messages).toEqual([]);
    expect(setMessages).toHaveBeenLastCalledWith([]);
  });

  it("resetActiveThread and clearThread reset conversation state", () => {
    const messages = [mockUserChatMessage("Hello")];
    const { result, rerender, setMessages } = renderChatThreads();

    rerender({ messages, role: "user" });
    const activeId = result.current.activeThread.id;

    act(() => {
      result.current.resetActiveThread();
    });

    expect(result.current.allThreads).toHaveLength(1);
    expect(result.current.activeThread.id).toBe(activeId);
    expect(result.current.activeThread.messages).toEqual([]);
    expect(result.current.activeThread.title).toBe(
      CHAT_THREAD_COPY.defaultTitle,
    );
    expect(setMessages).toHaveBeenCalledWith([]);

    act(() => {
      result.current.createNewThread();
      result.current.clearThread();
    });

    expect(result.current.allThreads).toHaveLength(1);
    expect(result.current.activeThread.messages).toEqual([]);
    expect(setMessages).toHaveBeenLastCalledWith([]);
  });

  it("loads the active thread when the app role changes", () => {
    const userThread = makeThread(
      "user-active",
      [mockUserChatMessage("User thread")],
      "User",
    );
    const managerThread = makeThread(
      "mgr-active",
      [mockUserChatMessage("Manager thread")],
      "Manager",
    );

    local.write(
      CHAT_STORAGE_KEYS.threadsByRole,
      JSON.stringify({
        user: { threads: [userThread], activeId: "user-active" },
        manager: { threads: [managerThread], activeId: "mgr-active" },
      }),
    );

    const { rerender, setMessages } = renderChatThreads({ role: "user" });

    rerender({ messages: [], role: "manager" });

    expect(setMessages).toHaveBeenCalledWith(managerThread.messages);
  });

  it("keeps empty preview when synced messages have no text", () => {
    const messages = [mockAssistantThinkingMessage()];
    const { result, rerender } = renderChatThreads();

    rerender({ messages, role: "user" });

    expect(result.current.activeThread.preview).toBe(
      CHAT_THREAD_COPY.emptyPreview,
    );
  });

  it("falls back when stored JSON is invalid or not an object", () => {
    local.write(CHAT_STORAGE_KEYS.threadsByRole, "{not-json");

    const invalidJson = renderChatThreads();
    expect(invalidJson.result.current.activeThread.title).toBe(
      CHAT_THREAD_COPY.defaultTitle,
    );

    local.write(CHAT_STORAGE_KEYS.threadsByRole, "null");
    const nullPayload = renderChatThreads();
    expect(nullPayload.result.current.allThreads).toHaveLength(1);
    expect(nullPayload.result.current.activeThread.messages).toEqual([]);

    local.write(CHAT_STORAGE_KEYS.threadsByRole, "42");
    const primitivePayload = renderChatThreads();
    expect(primitivePayload.result.current.activeThread.title).toBe(
      CHAT_THREAD_COPY.defaultTitle,
    );
  });

  it("repairs corrupted stored thread lists", () => {
    const valid = makeThread("valid-thread", [mockUserChatMessage("Hi")], "Hi");

    local.write(
      CHAT_STORAGE_KEYS.threadsByRole,
      JSON.stringify({
        user: {
          threads: [null, 42, { id: "bad-only" }, valid],
          activeId: "missing-active-id",
        },
        manager: {
          threads: "not-an-array",
          activeId: 99,
        },
      }),
    );

    const { result } = renderChatThreads({ role: "user" });

    expect(result.current.allThreads).toHaveLength(1);
    expect(result.current.activeThread.id).toBe("valid-thread");

    local.write(
      CHAT_STORAGE_KEYS.threadsByRole,
      JSON.stringify({
        user: { threads: [], activeId: "ghost" },
        manager: { threads: [{ id: "partial" }], activeId: "partial" },
      }),
    );

    const emptyRole = renderChatThreads({ role: "user" });
    expect(emptyRole.result.current.allThreads).toHaveLength(1);
    expect(emptyRole.result.current.activeThread.title).toBe(
      CHAT_THREAD_COPY.defaultTitle,
    );

    const partialManager = renderChatThreads({ role: "manager" });
    expect(partialManager.result.current.allThreads).toHaveLength(1);
    expect(partialManager.result.current.activeThread.title).toBe(
      CHAT_THREAD_COPY.defaultTitle,
    );
  });
});
