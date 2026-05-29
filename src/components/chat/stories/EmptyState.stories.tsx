import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn, userEvent, within } from "storybook/test";

import { ChatEmptyState } from "@/components/chat/empty-state";
import { QUICK_ACTIONS_BY_ROLE } from "@/constants/chat";
import { inChatTranscript } from "@/mocks/storybook";

const meta = {
  title: "Chat/EmptyState",
  component: ChatEmptyState,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Empty transcript placeholder with quick-action chips. Toggle **App theme** in the toolbar for light/dark.",
      },
    },
  },
  decorators: [inChatTranscript],
  args: {
    quickActions: QUICK_ACTIONS_BY_ROLE.user,
    onSelectPrompt: fn(),
  },
  argTypes: {
    quickActions: { control: false },
    onSelectPrompt: { action: "selectPrompt", table: { category: "Actions" } },
  },
} satisfies Meta<typeof ChatEmptyState>;

export default meta;

type Story = StoryObj<typeof ChatEmptyState>;

export const UserRole: Story = {};

export const ManagerRole: Story = {
  args: {
    quickActions: QUICK_ACTIONS_BY_ROLE.manager,
  },
};

export const Playground: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const firstAction = args.quickActions[0];
    if (!firstAction) return;
    await userEvent.click(canvas.getByRole("button", { name: firstAction.label }));
  },
};
