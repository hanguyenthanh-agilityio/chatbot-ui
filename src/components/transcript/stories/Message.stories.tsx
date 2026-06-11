import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ReactNode } from "react";
import { fn } from "storybook/test";

import { LoadingIndicator } from "@/components/chat/loading-indicator";
import { MessageAvatar, MessageBubble } from "@/components/chat/message-bubble";
import { ToolApprovalCard } from "@/components/chat/tool-approval-card";
import { ToolOutputTable } from "@/components/chat/tool-output-table";
import {
  CHAT_TRANSCRIPT_COPY,
  MOCK_CHAT_SAMPLE_MESSAGES,
} from "@/constants/chat";
import { inChatTranscript } from "@sb/decorators";
import {
  mockBalanceTableProps,
  mockMyRequestsTableProps,
} from "@/mocks/tool-output-table";

const VIEWS = [
  "user",
  "assistant",
  "table",
  "approval",
  "thinking",
  "stopped",
] as const;

const submitCopy = CHAT_TRANSCRIPT_COPY.toolApproval.submitRequest;

function TranscriptRow({
  isUser,
  children,
}: {
  isUser: boolean;
  children: ReactNode;
}) {
  return (
    <article
      className={`flex w-full gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser ? <MessageAvatar initials="EM" isUser={false} /> : null}
      <div
        className={
          isUser
            ? "flex min-w-0 max-w-message-column-user shrink-0 flex-col items-end"
            : "min-w-0 max-w-full flex-1"
        }
      >
        {children}
      </div>
      {isUser ? (
        <MessageAvatar initials="HN" isUser avatarLabel="User avatar" />
      ) : null}
    </article>
  );
}

type Args = {
  view: (typeof VIEWS)[number];
  userText: string;
  assistantText: string;
  tablePreset: "balance" | "requests";
};

function MessageUiPreview({
  view,
  userText,
  assistantText,
  tablePreset,
}: Args) {
  const row = (() => {
    switch (view) {
      case "user":
        return (
          <TranscriptRow isUser>
            <MessageBubble isUser text={userText} />
          </TranscriptRow>
        );
      case "assistant":
        return (
          <TranscriptRow isUser={false}>
            <MessageBubble isUser={false} text={assistantText} />
          </TranscriptRow>
        );
      case "table":
        return (
          <TranscriptRow isUser={false}>
            <MessageBubble isUser={false} fullWidth>
              <ToolOutputTable
                {...(tablePreset === "balance"
                  ? mockBalanceTableProps()
                  : mockMyRequestsTableProps())}
                onActionClick={fn()}
              />
            </MessageBubble>
          </TranscriptRow>
        );
      case "approval":
        return (
          <TranscriptRow isUser={false}>
            <ToolApprovalCard
              title={submitCopy.title}
              description={Array.from(
                { length: 4 },
                () =>
                  "Annual leave from 2026-07-01 to 2026-07-03. Reason: Family trip.",
              ).join(" ")}
              confirmLabel={submitCopy.confirmLabel}
              cancelLabel={submitCopy.cancelLabel}
              onConfirm={fn()}
              onCancel={fn()}
            />
          </TranscriptRow>
        );
      case "thinking":
        return (
          <TranscriptRow isUser={false}>
            <LoadingIndicator
              showAvatar={false}
              label="Thinking"
              className="max-w-thread-thinking"
            />
          </TranscriptRow>
        );
      case "stopped":
        return (
          <TranscriptRow isUser={false}>
            <MessageBubble
              isUser={false}
              placeholder={CHAT_TRANSCRIPT_COPY.responseStopped}
            />
          </TranscriptRow>
        );
    }
  })();

  return <div className="mx-auto w-full max-w-3xl">{row}</div>;
}

const meta = {
  title: "Transcript/ChatMessage",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Transcript row UI (avatar + bubble/cards). Uses mocks only — not the full `ChatMessage` runtime (no `ai` SDK in this story).",
      },
    },
  },
  decorators: [inChatTranscript],
  args: {
    view: "assistant",
    userText: MOCK_CHAT_SAMPLE_MESSAGES.userLeaveBalance,
    assistantText: MOCK_CHAT_SAMPLE_MESSAGES.assistantLeaveBalance,
    tablePreset: "balance",
  },
  argTypes: {
    view: { control: "select", options: VIEWS, table: { category: "Preview" } },
    userText: { control: "text", table: { category: "Content" } },
    assistantText: { control: "text", table: { category: "Content" } },
    tablePreset: {
      control: "select",
      options: ["balance", "requests"],
      table: { category: "Content" },
    },
  },
  render: (args) => <MessageUiPreview {...args} />,
} satisfies Meta<Args>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const User: Story = { args: { view: "user" } };
export const Assistant: Story = { args: { view: "assistant" } };
export const WithTable: Story = { args: { view: "table" } };
export const WithApproval: Story = { args: { view: "approval" } };
export const Thinking: Story = { args: { view: "thinking" } };
export const Stopped: Story = { args: { view: "stopped" } };
