import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ChatPanelResetButton } from '@/components/ui/chat-panel-reset-button';

const meta = {
  title: 'Chat/ChatPanelResetButton',
  component: ChatPanelResetButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Resets the entire chat panel (UI only). Sits next to the theme toggle in the header. Toggle **App theme** for light/dark.',
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
