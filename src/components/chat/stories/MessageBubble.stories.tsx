import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { MessageAvatar, MessageBubble } from "@/components/chat/message-bubble";
import { MOCK_CHAT_SAMPLE_MESSAGES } from "@/constants/chat";
import { STORYBOOK_THEME_GLOBAL, ThemeMode } from "@/constants/theme";
import { inChatTranscript } from "@/mocks/storybook";

const meta = {
  title: "Chat/MessageBubble",
  component: MessageBubble,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Chat transcript bubbles (`MessageBubble`) and row avatars (`MessageAvatar`). Used in `transcript/message.tsx`. User bubbles align right; assistant bubbles align left and can embed rich `children` (tables, cards).",
      },
    },
    a11y: {
      config: {
        rules: [{ id: "color-contrast", enabled: true }],
      },
    },
  },
  decorators: [inChatTranscript],
} satisfies Meta<typeof MessageBubble>;

export default meta;

type Story = StoryObj<typeof MessageBubble>;

/** User message (dark stone bubble, right-aligned in transcript). */
export const User: Story = {
  render: () => (
    <div className="flex justify-end gap-3">
      <MessageBubble
        isUser
        text={MOCK_CHAT_SAMPLE_MESSAGES.userLeaveBalanceDetailed}
      />
      <MessageAvatar initials="HN" isUser avatarLabel="Ha Nguyen" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText(
        MOCK_CHAT_SAMPLE_MESSAGES.userLeaveBalanceDetailed,
      ),
    ).toBeInTheDocument();
  },
};

/** Assistant text-only bubble. */
export const Assistant: Story = {
  render: () => (
    <div className="flex justify-start gap-3">
      <MessageAvatar initials="EM" isUser={false} />
      <MessageBubble
        isUser={false}
        text={MOCK_CHAT_SAMPLE_MESSAGES.assistantLeaveBalanceDetailed}
      />
    </div>
  ),
};

/** Loading / streaming placeholder. */
export const AssistantPlaceholder: Story = {
  render: () => (
    <div className="flex justify-start gap-3">
      <MessageAvatar initials="EM" isUser={false} />
      <MessageBubble isUser={false} placeholder="Working on it..." />
    </div>
  ),
};

/** Assistant bubble with nested content (tables, cards). */
export const AssistantWithChildren: Story = {
  render: () => (
    <div className="flex justify-start gap-3">
      <MessageAvatar initials="EM" isUser={false} />
      <MessageBubble
        isUser={false}
        text="Here is your leave summary:"
        fullWidth
      >
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm light:border-app-border light:bg-app-surface-subtle light:text-app-fg-muted">
          Table / tool output renders here
        </div>
      </MessageBubble>
    </div>
  ),
};

/** Full transcript row layout (matches `message.tsx` structure). */
export const ConversationRows: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <article className="flex justify-start gap-3">
        <MessageAvatar initials="EM" isUser={false} />
        <div className="min-w-0 flex-1">
          <MessageBubble
            isUser={false}
            text={MOCK_CHAT_SAMPLE_MESSAGES.assistantLeaveBalanceDetailed}
            fullWidth
          />
        </div>
      </article>
      <article className="flex justify-end gap-3">
        <div className="max-w-message-column-user min-w-0">
          <MessageBubble
            isUser
            text={MOCK_CHAT_SAMPLE_MESSAGES.userLeaveBalanceDetailed}
          />
        </div>
        <MessageAvatar initials="HN" isUser avatarLabel="Ha Nguyen" />
      </article>
    </div>
  ),
};

export const Light: Story = {
  globals: { [STORYBOOK_THEME_GLOBAL]: ThemeMode.Light },
  render: () => (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <div className="flex justify-start gap-3">
        <MessageAvatar initials="EM" isUser={false} />
        <MessageBubble
          isUser={false}
          text={MOCK_CHAT_SAMPLE_MESSAGES.assistantLeaveBalanceDetailed}
        />
      </div>
      <div className="flex justify-end gap-3">
        <MessageBubble
          isUser
          text={MOCK_CHAT_SAMPLE_MESSAGES.userLeaveBalanceDetailed}
        />
        <MessageAvatar initials="HN" isUser />
      </div>
    </div>
  ),
};

export const Dark: Story = {
  globals: { [STORYBOOK_THEME_GLOBAL]: ThemeMode.Dark },
  render: () => (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <div className="flex justify-start gap-3">
        <MessageAvatar initials="EM" isUser={false} />
        <MessageBubble
          isUser={false}
          text={MOCK_CHAT_SAMPLE_MESSAGES.assistantLeaveBalanceDetailed}
        />
      </div>
      <div className="flex justify-end gap-3">
        <MessageBubble
          isUser
          text={MOCK_CHAT_SAMPLE_MESSAGES.userLeaveBalanceDetailed}
        />
        <MessageAvatar initials="HN" isUser />
      </div>
    </div>
  ),
};
