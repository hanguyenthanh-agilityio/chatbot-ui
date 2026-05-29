import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ChatPanelResetButton } from "@/components/ui/chat-panel-reset-button";

const meta = {
  title: "Chat/ChatPanelResetButton",
  component: ChatPanelResetButton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Clears the current conversation (messages, draft input, errors). Stops an in-progress reply if needed. Sits next to the theme toggle in the header.",
      },
    },
  },
} satisfies Meta<typeof ChatPanelResetButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
