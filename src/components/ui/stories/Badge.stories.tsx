import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import {
  Badge,
  BADGE_SIZE_OPTIONS,
  BADGE_VARIANT_OPTIONS,
  type BadgeVariant,
} from "@/components/ui/badge";


const panelDecorator: Decorator = (Story) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
    <Story />
  </div>
);

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
    layout: "centered",
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
  decorators: [panelDecorator],
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
        className="space-y-3 rounded-2xl border border-white/10 bg-[linear-gradient(165deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-4 text-white"
      >
        <p className="font-dm-sans text-xs font-medium uppercase tracking-wider text-white/50">
          Dark
        </p>
        <VariantGrid />
      </div>
      <div
        data-theme="light"
        className="space-y-3 rounded-2xl border border-violet-200/40 bg-[linear-gradient(165deg,#fff,#f8f6ff)] p-4 text-brand-dark-100"
      >
        <p className="font-dm-sans text-xs font-medium uppercase tracking-wider text-brand-dark-100/50">
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


