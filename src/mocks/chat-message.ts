import type { ComponentProps } from "react";
import type { UIMessage } from "ai";
import { ChatMessage } from "@/components/transcript/message";
import { CHAT_TRANSCRIPT_COPY } from "@/constants/chat";
import { LEAVE_TYPE_LABEL_BY_TYPE } from "@/constants/leave";
import { createToolPart } from "@/mocks/transcript-tool-output";
import {
  FIXTURE_BALANCE_ANNUAL,
  FIXTURE_BALANCE_SICK,
  FIXTURE_REQUESTS,
} from "@/mocks/time-off-fixtures";

const ASSISTANT_METADATA = {
  agent: CHAT_TRANSCRIPT_COPY.defaultAgentName,
  agentLabel: CHAT_TRANSCRIPT_COPY.defaultAgentLabel,
} as const;

export function mockUserChatMessage(
  text: string,
  id = "msg-user-1",
): UIMessage {
  return {
    id,
    role: "user",
    parts: [{ type: "text", text }],
  };
}

export function mockAssistantTextMessage(
  text: string,
  id = "msg-assistant-1",
): UIMessage {
  return {
    id,
    role: "assistant",
    metadata: ASSISTANT_METADATA,
    parts: [{ type: "text", text }],
  };
}

export function mockAssistantThinkingMessage(id = "msg-assistant-thinking"): UIMessage {
  return {
    id,
    role: "assistant",
    metadata: ASSISTANT_METADATA,
    parts: [],
  };
}

export function mockAssistantBalanceTableMessage(
  id = "msg-assistant-balance",
): UIMessage {
  return {
    id,
    role: "assistant",
    metadata: ASSISTANT_METADATA,
    parts: [
      {
        type: "text",
        text: "Here is your current leave balance:",
      },
      createToolPart("get_my_time_off_balance", {
        balances: [
          FIXTURE_BALANCE_ANNUAL,
          { ...FIXTURE_BALANCE_SICK, used: 0, pending: 0, remaining: 5 },
        ],
      }),
    ],
  };
}

export function mockAssistantRequestsTableMessage(
  id = "msg-assistant-requests",
): UIMessage {
  return {
    id,
    role: "assistant",
    metadata: ASSISTANT_METADATA,
    parts: [
      createToolPart("list_my_time_off_requests", {
        requests: FIXTURE_REQUESTS,
      }),
    ],
  };
}

export function mockAssistantApprovalMessage(id = "msg-assistant-approval"): UIMessage {
  return {
    id,
    role: "assistant",
    metadata: ASSISTANT_METADATA,
    parts: [
      createToolPart(
        "submit_my_time_off_request",
        undefined,
        {
          state: "approval-requested",
          approval: { id: "approval-submit-1" },
          input: {
            leaveType: "annual",
            startDate: "2026-07-01",
            endDate: "2026-07-03",
            reason: "Family trip",
          },
        },
      ),
    ],
  };
}

export type MockChatMessageProps = ComponentProps<typeof ChatMessage>;

export function mockChatMessageProps(
  message: UIMessage,
  overrides?: Partial<Omit<MockChatMessageProps, "message">>,
): MockChatMessageProps {
  return {
    message,
    isLastMessage: true,
    isLoading: false,
    userInitials: "HN",
    userAvatarLabel: "User avatar",
    onSelectPrompt: () => {},
    onToolApproval: () => {},
    ...overrides,
  };
}

export function mockAssistantMutationSuccessMessage(
  id = "msg-assistant-success",
): UIMessage {
  return {
    id,
    role: "assistant",
    metadata: ASSISTANT_METADATA,
    parts: [
      createToolPart(
        "submit_my_time_off_request",
        {
          ok: true,
          request: {
            employeeName: "Thang Ho Quang",
            team: "Platform",
            leaveType: "annual",
            leaveTypeLabel: LEAVE_TYPE_LABEL_BY_TYPE.annual,
            startDate: "2026-07-01",
            endDate: "2026-07-03",
            days: 3,
            status: "pending",
          },
        },
        { preliminary: false },
      ),
      {
        type: "text",
        text: "Your request is in the queue. I can list pending items if you want.",
      },
    ],
  };
}
