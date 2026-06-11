import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LoadingIndicator } from "@/components/chat/loading-indicator";
import { STORYBOOK_THEME_GLOBAL } from "@/constants/storybook";
import { ThemeMode } from "@/constants/theme";
import { inChatTranscript } from "@sb/decorators";

const meta = {
  title: "Chat/LoadingIndicator",
  component: LoadingIndicator,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Assistant typing skeleton shown after a user message while the model is loading (`ChatTranscript`) or inside an empty assistant bubble (`ChatMessage`). Toggle **App theme** for light/dark.",
      },
    },
  },
  args: {
    showAvatar: true,
    label: "Thinking",
  },
  argTypes: {
    showAvatar: { control: "boolean", table: { category: "Layout" } },
    label: { control: "text", table: { category: "Content" } },
    className: { control: "text", table: { category: "Layout" } },
  },
  decorators: [inChatTranscript],
} satisfies Meta<typeof LoadingIndicator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoAvatar: Story = {
  args: { showAvatar: false },
};

export const CustomLabel: Story = {
  args: { label: "Assign: Employee Agent" },
};

export const LightTheme: Story = {
  globals: { [STORYBOOK_THEME_GLOBAL]: ThemeMode.Light },
};
