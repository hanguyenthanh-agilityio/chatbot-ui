import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ChatEmptyState } from "@/components/chat/empty-state";
import { inChatTranscript } from "../../../../.storybook/decorators";

const meta = {
  title: "Chat/EmptyState",
  component: ChatEmptyState,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Empty transcript hero (avatar, title, description). Quick-action chips live above the composer and stay visible during the conversation.",
      },
    },
  },
  decorators: [inChatTranscript],
} satisfies Meta<typeof ChatEmptyState>;

export default meta;

type Story = StoryObj<typeof ChatEmptyState>;

export const Default: Story = {};
