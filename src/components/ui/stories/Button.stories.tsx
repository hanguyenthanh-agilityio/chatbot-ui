import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Button } from "@/components/ui/button";
import { inStorybookUiPanel } from "@/mocks/storybook";
import { STORYBOOK_INLINE_CANVAS_PARAMETERS } from "@/constants/storybook";

/** Standard variants (exclude `themeToggle` — see ThemeToggle stories). */
const STANDARD_VARIANTS = [
  "primary",
  "secondary",
  "outline",
  "ghost",
  "danger",
] as const;

type StandardVariant = (typeof STANDARD_VARIANTS)[number];

const SIZE_OPTIONS = ["sm", "md", "lg"] as const;

function VariantGrid({
  size = "md",
  label = (variant) => variant,
  onClick = fn(),
}: {
  size?: (typeof SIZE_OPTIONS)[number];
  label?: (variant: StandardVariant) => string;
  onClick?: () => void;
}) {
  return (
    <div className="flex max-w-lg flex-wrap gap-2">
      {STANDARD_VARIANTS.map((variant) => (
        <Button key={variant} variant={variant} size={size} onClick={onClick}>
          {label(variant)}
        </Button>
      ))}
    </div>
  );
}

const meta = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    ...STORYBOOK_INLINE_CANVAS_PARAMETERS,
    a11y: {
      config: {
        rules: [{ id: "color-contrast", enabled: true }],
      },
    },
  },
  args: {
    children: "Button",
    variant: "primary",
    size: "md",
    fullWidth: false,
    disabled: false,
    isLoading: false,
    type: "button",
    onClick: fn(),
  },
  argTypes: {
    children: { control: "text", table: { category: "Content" } },
    variant: {
      control: "select",
      options: [...STANDARD_VARIANTS],
      table: { category: "Appearance" },
    },
    size: {
      control: "select",
      options: [...SIZE_OPTIONS],
      table: { category: "Appearance" },
    },
    fullWidth: { control: "boolean", table: { category: "Layout" } },
    disabled: { control: "boolean", table: { category: "State" } },
    isLoading: { control: "boolean", table: { category: "State" } },
    className: { control: "text", table: { category: "Appearance" } },
    type: {
      control: "select",
      options: ["button", "submit", "reset"],
      table: { category: "HTML" },
    },
    onClick: { action: "clicked", table: { category: "Actions" } },
    ref: { table: { disable: true } },
  },
  decorators: [inStorybookUiPanel],
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof Button>;

export const Playground: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: String(args.children) });
    await expect(button).toBeEnabled();
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalled();
  },
};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => <VariantGrid onClick={fn()} />,
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {SIZE_OPTIONS.map((size) => (
        <Button key={size} size={size} variant="primary" onClick={fn()}>
          {size}
        </Button>
      ))}
    </div>
  ),
};

export const Primary: Story = {
  args: { children: "Primary", variant: "primary" },
};

export const Secondary: Story = {
  args: { children: "Secondary", variant: "secondary" },
};

export const Outline: Story = {
  args: { children: "Outline", variant: "outline" },
};

export const Ghost: Story = {
  args: { children: "Ghost", variant: "ghost" },
};

export const Danger: Story = {
  args: { children: "Delete", variant: "danger" },
};

export const Loading: Story = {
  args: { children: "Saving…", isLoading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button")).toBeDisabled();
  },
};

export const Disabled: Story = {
  args: { children: "Disabled", disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button")).toBeDisabled();
  },
};

export const FullWidth: Story = {
  args: { children: "Full width", fullWidth: true },
  decorators: [
    (Story) => (
      <div className="w-[280px]">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button")).toHaveClass("w-full");
  },
};
