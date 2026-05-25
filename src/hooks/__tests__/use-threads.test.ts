import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { UIMessage } from "ai";

import { useChatThreads } from "@/hooks/use-threads";

const baseMessage: UIMessage = {
  id: "msg-1",
  role: "user",
  parts: [{ type: "text", text: "Hello" }],
};

describe("useChatThreads", () => {
  it("resetChatPanel clears active thread messages without removing other threads", () => {
    const setMessages = vi.fn();

    const { result } = renderHook(() =>
      useChatThreads({
        messages: [baseMessage],
        setMessages,
        provider: "openai",
        role: "user",
      }),
    );

    const threadId = result.current.activeThread.id;

    act(() => {
      result.current.resetChatPanel();
    });

    expect(setMessages).toHaveBeenCalledWith([]);
    expect(result.current.activeThread.id).toBe(threadId);
    expect(result.current.activeThread.messages).toEqual([]);
    expect(result.current.allThreads).toHaveLength(1);
  });
});
