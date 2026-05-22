import type { ComponentProps } from "react";
import type { UIMessage } from "ai";
import { ChatMessage } from "@/components/transcript/message";
import { CHAT_TRANSCRIPT_COPY } from "@/constants/chat";

const ASSISTANT_METADATA = {
  agent: CHAT_TRANSCRIPT_COPY.defaultAgentName,
  agentLabel: CHAT_TRANSCRIPT_COPY.defaultAgentLabel,
} as const;

function toolPart(
  toolName: string,
  partial: Record<string, unknown>,
): UIMessage["parts"][number] {
  return {
    type: `tool-${toolName}`,
    toolCallId: `tc-${toolName}`,
    ...partial,
  } as UIMessage["parts"][number];
}

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
      toolPart("get_my_time_off_balance", {
        state: "output-available",
        input: {},
        output: {
          balances: [
            {
              leaveType: "annual",
              allowance: 14,
              used: 2,
              pending: 1,
              remaining: 11,
            },
            {
              leaveType: "sick",
              allowance: 5,
              used: 0,
              pending: 0,
              remaining: 5,
            },
          ],
        },
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
      toolPart("list_my_time_off_requests", {
        state: "output-available",
        input: {},
        output: {
          requests: [
            {
              leaveType: "annual",
              leaveTypeLabel: "Annual leave",
              startDate: "2026-06-10",
              endDate: "2026-06-12",
              days: 3,
              status: "pending",
            },
            {
              leaveType: "sick",
              leaveTypeLabel: "Sick leave",
              startDate: "2026-05-02",
              endDate: "2026-05-02",
              days: 1,
              status: "approved",
            },
          ],
        },
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
      toolPart("submit_my_time_off_request", {
        state: "approval-requested",
        approval: { id: "approval-submit-1" },
        input: {
          leaveType: "annual",
          startDate: "2026-07-01",
          endDate: "2026-07-03",
          reason: "Family trip",
        },
      }),
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
      toolPart("submit_my_time_off_request", {
        state: "output-available",
        preliminary: false,
        input: {},
        output: {
          ok: true,
          request: {
            employeeName: "Thang Ho Quang",
            team: "Platform",
            leaveType: "annual",
            leaveTypeLabel: "Annual leave",
            startDate: "2026-07-01",
            endDate: "2026-07-03",
            days: 3,
            status: "pending",
          },
        },
      }),
      {
        type: "text",
        text: "Your request is in the queue. I can list pending items if you want.",
      },
    ],
  };
}
