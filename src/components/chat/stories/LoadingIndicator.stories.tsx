import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite";
import { LoadingIndicator } from "@/components/chat/loading-indicator";
import {
  STORYBOOK_THEME_GLOBAL,
  THEME_SHELL_CLASSES,
  THEME_SHELL_UTILITIES,
  ThemeMode,
} from "@/constants/theme";
import { cn } from "@/utils/class-name";

const inChatPanel: Decorator = (Story) => (
  <section
    className={cn(
      THEME_SHELL_CLASSES.chatPanel,
      "mx-auto w-full max-w-3xl rounded-shell border p-6 shadow-shell-panel",
      "bg-glass-panel-chat text-white",
      THEME_SHELL_UTILITIES.border,
    )}
  >
    <Story />
  </section>
);

const meta = {
  title: "Chat/LoadingIndicator",
  component: LoadingIndicator,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
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
  decorators: [inChatPanel],
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
