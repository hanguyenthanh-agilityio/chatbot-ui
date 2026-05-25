import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState, type ComponentProps, type FormEvent } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { ChatComposer } from "@/components/chat/composer";
import { CHAT_COMPOSER_COPY, MOCK_CHAT_SAMPLE_MESSAGES } from "@/constants/chat";
import {
  STORYBOOK_THEME_GLOBAL,
  THEME_SHELL_CLASSES,
  THEME_SHELL_UTILITIES,
  ThemeMode,
} from "@/constants/theme";
import {
  mockChatComposerProps,
  MOCK_COMPOSER_TOOLTIP,
} from "@/mocks/chat-composer";
import { cn } from "@/utils/class-name";

const inChatPanel: Decorator = (Story) => (
  <section
    className={cn(
      THEME_SHELL_CLASSES.chatPanel,
      "mx-auto flex w-full max-w-3xl flex-col overflow-hidden rounded-shell border shadow-shell-panel",
      "bg-glass-panel-chat",
      THEME_SHELL_UTILITIES.border,
    )}
  >
    <div className="min-h-48 flex-1" />
    <Story />
  </section>
);

type ComposerStoryProps = ComponentProps<typeof ChatComposer> & {
  initialInput?: string;
};

function ComposerWithState(
  props: Omit<
    ComposerStoryProps,
    "input" | "onInputChange" | "onSubmitAction"
  > & {
    initialInput?: string;
    onInputChange?: ComposerStoryProps["onInputChange"];
    onSubmitAction?: ComposerStoryProps["onSubmitAction"];
  },
) {
  const [input, setInput] = useState(props.initialInput ?? "");
  return (
    <ChatComposer
      {...props}
      input={input}
      onInputChange={(value) => {
        setInput(value);
        props.onInputChange?.(value);
      }}
      onSubmitAction={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        props.onSubmitAction?.(event);
      }}
    />
  );
}

const meta = {
  title: "Chat/Composer",
  component: ChatComposer,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Bottom chat composer: auto-growing textarea, send button, helper line, and optional error banner. Disabled until the provider is ready; hover shows `inputTooltip`. **Enter** submits when `canSend` is true; **Shift+Enter** inserts a newline. Toggle **App theme** in the toolbar for light/dark tokens.",
      },
    },
    a11y: {
      config: {
        rules: [{ id: "color-contrast", enabled: true }],
      },
    },
  },
  args: {
    ...mockChatComposerProps({
      onInputChange: fn(),
      onSubmitAction: fn(),
    }),
    initialInput: "",
    helperText: CHAT_COMPOSER_COPY.defaultHelperText,
    errorMessage: null,
    inputTooltip: MOCK_COMPOSER_TOOLTIP,
  },
  argTypes: {
    input: { table: { disable: true } },
    onInputChange: {
      action: "input changed",
      description: "Fires on each textarea change.",
      table: { category: "Actions" },
    },
    onSubmitAction: {
      action: "submitted",
      description: "Fires when the form is submitted (button or Enter).",
      table: { category: "Actions" },
    },
    canSend: {
      control: "boolean",
      description: "Enables submit and active send styling.",
      table: { category: "State" },
    },
    isLoading: {
      control: "boolean",
      description: "Shows loading indicator on the send button.",
      table: { category: "State" },
    },
    isProviderReady: {
      control: "boolean",
      description: "When false, textarea is disabled and tooltip can show.",
      table: { category: "State" },
    },
    helperText: {
      control: "text",
      description:
        "Footer hint; defaults to `CHAT_COMPOSER_COPY.defaultHelperText`.",
      table: { category: "Content" },
    },
    errorMessage: {
      control: "text",
      description: "Optional banner above the field (null hides it).",
      table: { category: "Content" },
    },
    inputTooltip: {
      control: "text",
      description: "Shown when provider is not ready (hover/click wrapper).",
      table: { category: "Content" },
    },
    initialInput: {
      control: "text",
      description:
        "Story-only seed value; `ComposerWithState` owns live input state.",
      table: { category: "Content" },
    },
  },
  decorators: [inChatPanel],
  render: (args) => {
    const {
      initialInput,
      onInputChange,
      onSubmitAction,
      input: _input,
      ...composerArgs
    } = args;
    return (
      <ComposerWithState
        {...composerArgs}
        initialInput={initialInput}
        onInputChange={onInputChange}
        onSubmitAction={onSubmitAction}
      />
    );
  },
} satisfies Meta<ComposerStoryProps>;

export default meta;

type Story = StoryObj<typeof meta>;

/** All controls + Actions (`onInputChange`, `onSubmitAction`). */
export const Playground: Story = {};

/** Provider ready; send enabled with sample text. */
export const Ready: Story = {
  args: {
    initialInput: MOCK_CHAT_SAMPLE_MESSAGES.userLeaveBalance,
    canSend: true,
    isProviderReady: true,
  },
};

/** Send button disabled while `isLoading` (play assertion). */
export const Loading: Story = {
  args: {
    initialInput: "Checking balance…",
    canSend: true,
    isLoading: true,
    isProviderReady: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", { name: CHAT_COMPOSER_COPY.sendButtonLabel }),
    ).toBeDisabled();
  },
};

/** Textarea disabled; hover shows verify-provider tooltip (play). */
export const ProviderNotReady: Story = {
  args: {
    canSend: false,
    isProviderReady: false,
    inputTooltip: MOCK_COMPOSER_TOOLTIP,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", {
      name: CHAT_COMPOSER_COPY.ariaLabel,
    });
    await expect(input).toBeDisabled();
    await userEvent.hover(input.parentElement!.parentElement!);
    await expect(canvas.getByText(MOCK_COMPOSER_TOOLTIP)).toBeInTheDocument();
  },
};

/** Error banner + disabled send. */
export const WithError: Story = {
  args: {
    errorMessage: "Failed to send message. Please try again.",
    canSend: false,
    isProviderReady: true,
  },
};

/** Warm Paper light tokens (`App theme` toolbar). */
export const Light: Story = {
  globals: { [STORYBOOK_THEME_GLOBAL]: ThemeMode.Light },
  args: {
    initialInput: "List my pending requests",
    canSend: true,
    isProviderReady: true,
  },
};

/** Default dark glass composer bar. */
export const Dark: Story = {
  globals: { [STORYBOOK_THEME_GLOBAL]: ThemeMode.Dark },
  args: {
    initialInput: "List my pending requests",
    canSend: true,
    isProviderReady: true,
  },
};
