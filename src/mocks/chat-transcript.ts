import type { ComponentProps, RefObject } from "react";
import { createRef } from "react";
import { ChatTranscript } from "@/components/transcript";
import {
  MOCK_CHAT_SAMPLE_MESSAGES,
} from "@/constants/chat";
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
    onSelectPrompt: () => {},
    onToolApproval: () => {},
    ...overrides,
  };
}

export function mockChatTranscriptWithMessages(): MockChatTranscriptProps {
  return mockChatTranscriptProps({
    messages: [
      mockUserChatMessage(MOCK_CHAT_SAMPLE_MESSAGES.userLeaveBalance),
      mockAssistantTextMessage(MOCK_CHAT_SAMPLE_MESSAGES.assistantLeaveBalance),
    ],
  });
}
