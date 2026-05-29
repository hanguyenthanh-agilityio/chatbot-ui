import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { ChatQuickActions } from "@/components/chat/quick-actions";
import { QUICK_ACTIONS_BY_ROLE } from "@/constants/chat";
import type { AppRole } from "@/lib/auth/session";
import { STORYBOOK_INLINE_CANVAS_PARAMETERS } from "@/constants/theme";
import { cn } from "@/utils/class-name";

/** Matches the composer footer strip where chips render in the app. */
const inComposerBar: Decorator = (Story) => (
  <div
    className={cn(
      "inline-flex w-full max-w-3xl flex-col gap-2 border-t border-white/8 px-4 py-3 shadow-composer-bar backdrop-blur-shell bg-glass-composer sm:px-6 lg:px-8 light:border-app-border-subtle light:backdrop-blur-none",
    )}
  >
    <Story />
  </div>
);

type QuickActionsStoryArgs = {
  role: AppRole;
  showActions: boolean;
  actionCount: number;
  onSelectPrompt: (prompt: string) => void;
};

function resolveQuickActions({
  role,
  showActions,
  actionCount,
}: Pick<QuickActionsStoryArgs, "role" | "showActions" | "actionCount">) {
  if (!showActions) {
    return [];
  }

  return QUICK_ACTIONS_BY_ROLE[role].slice(0, actionCount);
}

function renderQuickActions({
  role,
  showActions,
  actionCount,
  onSelectPrompt,
}: QuickActionsStoryArgs) {
  return (
    <ChatQuickActions
      quickActions={resolveQuickActions({ role, showActions, actionCount })}
      onSelectPrompt={onSelectPrompt}
    />
  );
}

const meta = {
  title: "Chat/QuickActions",
  tags: ["autodocs"],
  parameters: {
    ...STORYBOOK_INLINE_CANVAS_PARAMETERS,
    docs: {
      description: {
        component:
          "Suggestion chips above the composer. Always visible during a conversation; each chip calls `onSelectPrompt` with a preset prompt. Toggle **App theme** in the toolbar for light/dark.",
      },
    },
    a11y: {
      config: {
        rules: [{ id: "color-contrast", enabled: true }],
      },
    },
  },
  decorators: [inComposerBar],
  render: renderQuickActions,
  args: {
    role: "user",
    showActions: true,
    actionCount: 3,
    onSelectPrompt: fn(),
  },
  argTypes: {
    role: {
      control: "select",
      options: ["user", "manager"] satisfies AppRole[],
      description: "Preset chip set from `QUICK_ACTIONS_BY_ROLE`.",
      table: { category: "Content" },
    },
    showActions: {
      control: "boolean",
      description: "When false, `quickActions` is empty and nothing renders.",
      table: { category: "State" },
    },
    actionCount: {
      control: { type: "number", min: 0, max: 5, step: 1 },
      description: "How many chips to show from the selected role preset.",
      table: { category: "Content" },
    },
    onSelectPrompt: {
      action: "selectPrompt",
      table: { category: "Actions" },
    },
  },
} satisfies Meta<QuickActionsStoryArgs>;

export default meta;

type Story = StoryObj<QuickActionsStoryArgs>;

export const Playground: Story = {
  play: async ({ canvasElement, args }) => {
    if (!args.showActions || args.actionCount === 0) {
      return;
    }

    const canvas = within(canvasElement);
    const actions = resolveQuickActions(args);
    const firstAction = actions[0];
    if (!firstAction) return;

    await userEvent.click(
      canvas.getByRole("button", { name: firstAction.label }),
    );
    await expect(args.onSelectPrompt).toHaveBeenCalledWith(firstAction.prompt);
  },
};

export const UserRole: Story = {
  parameters: { controls: { disable: true } },
  args: {
    role: "user",
    showActions: true,
    actionCount: 3,
  },
};

export const ManagerRole: Story = {
  parameters: { controls: { disable: true } },
  args: {
    role: "manager",
    showActions: true,
    actionCount: 5,
  },
};
