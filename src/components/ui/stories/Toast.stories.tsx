import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Toast, type ToastVariant } from "@/components/ui/toast";
import {
  TOAST_DEFAULT_DURATION_MS,
  TOAST_DEMO_MESSAGE,
  TOAST_PERSISTENT_DURATION_MS,
  TOAST_VARIANTS,
} from "@/constants/toast";
import { STORYBOOK_INLINE_CANVAS_PARAMETERS } from "@/constants/storybook";

function ToastPreviewFrame({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center justify-center p-4">
      <div className="w-fit max-w-sm">{children}</div>
    </div>
  );
}

const withToastPreview: Decorator = (Story) => (
  <ToastPreviewFrame>
    <Story />
  </ToastPreviewFrame>
);

const meta = {
  title: "UI/Toast",
  component: Toast,
  tags: ["autodocs"],
  parameters: {
    ...STORYBOOK_INLINE_CANVAS_PARAMETERS,
    docs: {
      description: {
        component:
          "Transient notification (`layout=fixed`, top-right in the app). Storybook uses `layout=inline` and `durationMs=0` so previews stay visible.",
      },
    },
    a11y: {
      config: {
        rules: [{ id: "color-contrast", enabled: true }],
      },
    },
  },
  decorators: [withToastPreview],
  args: {
    message: TOAST_DEMO_MESSAGE,
    variant: "success",
    layout: "inline",
    durationMs: TOAST_PERSISTENT_DURATION_MS,
    onDismiss: () => {},
  },
  argTypes: {
    variant: {
      control: "select",
      options: [...TOAST_VARIANTS],
      table: { category: "Appearance" },
    },
    message: { control: "text", table: { category: "Content" } },
    layout: {
      control: "select",
      options: ["inline", "fixed"],
      table: { category: "Layout" },
    },
    durationMs: {
      control: { type: "number", min: 0, step: 500 },
      table: {
        category: "Behavior",
        defaultValue: { summary: String(TOAST_PERSISTENT_DURATION_MS) },
      },
      description:
        "`0` = no auto-dismiss (Storybook default). Use 3500 to preview production timing.",
    },
    onDismiss: { action: "dismissed", table: { category: "Actions" } },
  },
} satisfies Meta<typeof Toast>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Success: Story = {
  args: { variant: "success" },
};

export const Error: Story = {
  args: { message: "Something went wrong", variant: "error" },
};

export const Info: Story = {
  args: { message: "Here is some information", variant: "info" },
};

const DEMO_MESSAGES: Record<ToastVariant, string> = {
  success: "Leave request submitted",
  error: "Could not save changes",
  info: "Syncing with company system…",
};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-full flex-col gap-3">
      {TOAST_VARIANTS.map((variant) => (
        <Toast
          key={variant}
          variant={variant}
          message={DEMO_MESSAGES[variant]}
          layout="inline"
          durationMs={TOAST_PERSISTENT_DURATION_MS}
          onDismiss={() => {}}
        />
      ))}
    </div>
  ),
};

export const Interactive: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Click to replay production auto-dismiss. Playground keeps the toast visible (`durationMs=0`).",
      },
    },
  },
  decorators: [],
  render: (args) => {
    const [show, setShow] = useState(false);

    return (
      <div className="flex w-full max-w-md flex-col items-start gap-4 p-6">
        <Button type="button" variant="primary" onClick={() => setShow(true)}>
          Show toast (production timing)
        </Button>
        {show ? (
          <Toast
            {...args}
            layout="inline"
            durationMs={TOAST_DEFAULT_DURATION_MS}
            onDismiss={() => setShow(false)}
          />
        ) : (
          <p className="text-sm text-white/55 light:text-app-fg-tertiary">
            Toast auto-dismisses after ~3.5s. Click again to replay.
          </p>
        )}
      </div>
    );
  },
  args: {
    message: "Toast demo with animation",
    variant: "success",
    layout: "inline",
    durationMs: TOAST_DEFAULT_DURATION_MS,
  },
};
