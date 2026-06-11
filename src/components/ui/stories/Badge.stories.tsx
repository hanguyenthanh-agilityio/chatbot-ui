import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import {
  Badge,
  BADGE_SIZE_OPTIONS,
  BADGE_VARIANT_OPTIONS,
  type BadgeVariant,
} from "@/components/ui/badge";
import { inStorybookUiPanel } from "@/mocks/storybook";
import { STORYBOOK_INLINE_CANVAS_PARAMETERS } from "@/constants/storybook";

function VariantGrid({
  variants = BADGE_VARIANT_OPTIONS,
}: {
  variants?: BadgeVariant[];
}) {
  return (
    <div className="flex max-w-lg flex-wrap gap-2">
      {variants.map((variant) => (
        <Badge key={variant} variant={variant}>
          {variant}
        </Badge>
      ))}
    </div>
  );
}

const meta = {
  title: "UI/Badge",
  component: Badge,
  parameters: {
    ...STORYBOOK_INLINE_CANVAS_PARAMETERS,
    a11y: {
      config: {
        rules: [{ id: "color-contrast", enabled: true }],
      },
    },
  },
  args: {
    children: "Badge",
    variant: "neutral",
    size: "md",
    onClick: fn(),
  },
  argTypes: {
    children: { control: "text", table: { category: "Content" } },
    variant: {
      control: "select",
      options: BADGE_VARIANT_OPTIONS,
      table: { category: "Appearance" },
    },
    size: {
      control: "select",
      options: BADGE_SIZE_OPTIONS,
      table: { category: "Appearance" },
    },
    className: { control: "text", table: { category: "Appearance" } },
    onClick: { table: { category: "Actions" } },
  },
  decorators: [inStorybookUiPanel],
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof Badge>;

export const Playground: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <VariantGrid />
    </div>
  ),
};

export const ThemeComparison: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid gap-6 sm:grid-cols-2">
      <div
        data-theme="dark"
        className="space-y-3 rounded-2xl border border-white/10 bg-preview-dark p-4 text-white"
      >
        <p className="font-secondary text-xs font-medium uppercase tracking-wider text-white/50 light:text-app-fg-faint">
          Dark
        </p>
        <VariantGrid />
      </div>
      <div
        data-theme="light"
        className="space-y-3 rounded-2xl border border-white/10 bg-preview-light p-4 light:border-app-border light:text-app-fg"
      >
        <p className="font-secondary text-xs font-medium uppercase tracking-wider text-white/50 light:text-app-fg-faint">
          Light
        </p>
        <VariantGrid />
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {BADGE_SIZE_OPTIONS.map((size) => (
        <Badge key={size} size={size} variant="brand">
          {size}
        </Badge>
      ))}
    </div>
  ),
};
