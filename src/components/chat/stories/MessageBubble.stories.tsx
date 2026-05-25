import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import {
  MessageAvatar,
  MessageBubble,
} from "@/components/chat/message-bubble";
import {
  STORYBOOK_THEME_GLOBAL,
  THEME_SHELL_CLASSES,
  THEME_SHELL_UTILITIES,
  ThemeMode,
} from "@/constants/theme";
import { cn } from "@/utils/class-name";

const inChatTranscript: Decorator = (Story) => (
  <section
    className={cn(
      THEME_SHELL_CLASSES.chatPanel,
      "mx-auto w-full max-w-3xl rounded-shell border p-6 shadow-shell-panel",
      "bg-glass-panel-chat",
      THEME_SHELL_UTILITIES.border,
    )}
  >
    <Story />
  </section>
);

const SAMPLE_USER_TEXT = "How many annual, sick, and personal leave days do I have left?";
const SAMPLE_ASSISTANT_TEXT =
  "You have 12 annual, 8 sick, and 3 personal days remaining.";

const meta = {
  title: "Chat/MessageBubble",
  component: MessageBubble,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
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
      <MessageBubble isUser text={SAMPLE_USER_TEXT} />
      <MessageAvatar initials="HN" isUser avatarLabel="Ha Nguyen" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText(SAMPLE_USER_TEXT),
    ).toBeInTheDocument();
  },
};

/** Assistant text-only bubble. */
export const Assistant: Story = {
  render: () => (
    <div className="flex justify-start gap-3">
      <MessageAvatar initials="EM" isUser={false} />
      <MessageBubble isUser={false} text={SAMPLE_ASSISTANT_TEXT} />
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
      <MessageBubble isUser={false} text="Here is your leave summary:" fullWidth>
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
          <MessageBubble isUser={false} text={SAMPLE_ASSISTANT_TEXT} fullWidth />
        </div>
      </article>
      <article className="flex justify-end gap-3">
        <div className="flex max-w-message-column-user flex-col items-end">
          <MessageBubble isUser text={SAMPLE_USER_TEXT} />
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
        <MessageBubble isUser={false} text={SAMPLE_ASSISTANT_TEXT} />
      </div>
      <div className="flex justify-end gap-3">
        <MessageBubble isUser text={SAMPLE_USER_TEXT} />
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
        <MessageBubble isUser={false} text={SAMPLE_ASSISTANT_TEXT} />
      </div>
      <div className="flex justify-end gap-3">
        <MessageBubble isUser text={SAMPLE_USER_TEXT} />
        <MessageAvatar initials="HN" isUser />
      </div>
    </div>
  ),
};
