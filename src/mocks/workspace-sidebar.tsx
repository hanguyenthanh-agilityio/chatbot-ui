import type { ComponentProps } from "react";

import { ThreadSidebar } from "@/components/workspace/sidebar";
import { mockUserChatMessage } from "@/mocks/chat-message";
import type { ChatThread } from "@/types/thread";

export type MockThreadSidebarProps = ComponentProps<typeof ThreadSidebar>;

export function mockChatThread(
  overrides: Partial<ChatThread> = {},
): ChatThread {
  return {
    id: "thread-1",
    title: "Leave balance",
    preview: "What is my annual leave balance?",
    createdAt: "2026-05-20T10:00:00.000Z",
    updatedAt: "2026-05-20T10:00:00.000Z",
    provider: "openai",
    messages: [mockUserChatMessage("Hello")],
    ...overrides,
  };
}

const accountPanel = <div>Account panel</div>;
const providerPanel = <div>Provider panel</div>;

export function mockThreadSidebarProps(
  overrides: Partial<MockThreadSidebarProps> = {},
): MockThreadSidebarProps {
  const activeThread = overrides.activeThread ?? mockChatThread();
  const allThreads = overrides.allThreads ?? [activeThread];

  return {
    activeThread,
    allThreads,
    accountPanel,
    providerPanel,
    onSwitchThread: () => {},
    onCreateThread: () => {},
    onDeleteThread: () => {},
    ...overrides,
  };
}
