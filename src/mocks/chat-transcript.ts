import type { ComponentProps, RefObject } from "react";
import { createRef } from "react";
import { ChatTranscript } from "@/components/transcript";
import { QUICK_ACTIONS_BY_ROLE } from "@/constants/chat";
import {
  mockAssistantTextMessage,
  mockUserChatMessage,
} from "@/mocks/chat-message";

export type MockChatTranscriptProps = ComponentProps<typeof ChatTranscript>;

export function mockChatTranscriptProps(
  overrides?: Partial<MockChatTranscriptProps>,
): MockChatTranscriptProps {
  return {
    containerRef: createRef<HTMLDivElement>() as RefObject<HTMLDivElement>,
    messages: [],
    isLoading: false,
    quickActions: QUICK_ACTIONS_BY_ROLE.user,
    onSelectPrompt: () => {},
    onToolApproval: () => {},
    ...overrides,
  };
}

export function mockChatTranscriptWithMessages(): MockChatTranscriptProps {
  return mockChatTranscriptProps({
    messages: [
      mockUserChatMessage("How many leave days do I have left?"),
      mockAssistantTextMessage("You have 12 annual days remaining."),
    ],
  });
}
