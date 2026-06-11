import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Input } from "@/components/ui/input";
import { inStorybookUiPanel } from "@sb/decorators";
import { STORYBOOK_INLINE_CANVAS_PARAMETERS } from "@/constants/storybook";

const VARIANT_OPTIONS = [
  "default",
  "subtle",
  "ghost",
  "error",
  "panel",
] as const;

type InputVariant = (typeof VARIANT_OPTIONS)[number];

const SIZE_OPTIONS = ["sm", "md", "lg"] as const;

function VariantGrid({
  controlSize = "md",
  placeholder = (variant) => variant,
}: {
  controlSize?: (typeof SIZE_OPTIONS)[number];
  placeholder?: (variant: InputVariant) => string;
}) {
  return (
    <div className="flex w-[280px] flex-col gap-3">
      {VARIANT_OPTIONS.map((variant) => (
        <Input
          key={variant}
          variant={variant}
          controlSize={controlSize}
          placeholder={placeholder(variant)}
          aria-label={variant}
        />
      ))}
    </div>
  );
}

const meta = {
  title: "UI/Input",
  component: Input,
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
    "aria-label": "Input field",
    variant: "default",
    controlSize: "md",
    fullWidth: false,
    disabled: false,
    placeholder: "Enter text…",
    type: "text",
    onChange: fn(),
  },
  argTypes: {
    "aria-label": { control: "text", table: { category: "A11y" } },
    variant: {
      control: "select",
      options: [...VARIANT_OPTIONS],
      table: { category: "Appearance" },
    },
    controlSize: {
      control: "select",
      options: [...SIZE_OPTIONS],
      table: { category: "Appearance" },
    },
    fullWidth: { control: "boolean", table: { category: "Layout" } },
    disabled: { control: "boolean", table: { category: "State" } },
    placeholder: { control: "text", table: { category: "Content" } },
    type: {
      control: "select",
      options: ["text", "email", "password", "search", "tel", "url", "number"],
      table: { category: "HTML" },
    },
    className: { control: "text", table: { category: "Appearance" } },
    onChange: { action: "changed", table: { category: "Actions" } },
    ref: { table: { disable: true } },
  },
  decorators: [inStorybookUiPanel],
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof Input>;

export const Playground: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", {
      name: String(args["aria-label"]),
    });
    await expect(input).toBeEnabled();
    await userEvent.type(input, "hello");
    await expect(input).toHaveValue("hello");
    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => <VariantGrid />,
};

export const Default: Story = {
  args: { variant: "default", placeholder: "Default input" },
};

export const Ghost: Story = {
  args: { variant: "ghost", placeholder: "Ghost input" },
};

export const Error: Story = {
  args: {
    variant: "error",
    placeholder: "Invalid value",
    "aria-invalid": true,
  },
};

export const Disabled: Story = {
  args: { disabled: true, placeholder: "Disabled", value: "Cannot edit" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox")).toBeDisabled();
  },
};
