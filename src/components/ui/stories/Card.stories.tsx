import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { AUTH_PANEL_COPY } from "@/constants/auth";
import { PROVIDER_PANEL_COPY } from "@/constants/provider";
import { THEME_SHELL_CLASSES, THEME_SHELL_UTILITIES } from "@/constants/theme";
import { cn } from "@/utils/class-name";

const CARD_VARIANTS = ["glass", "panel", "soft", "success", "danger"] as const;

type CardVariant = (typeof CARD_VARIANTS)[number];

const inAppShell: Decorator = (Story) => (
  <aside
    className={cn(
      THEME_SHELL_CLASSES.sidebar,
      "mx-auto w-full max-w-sm rounded-shell border p-5 backdrop-blur-shell shadow-shell",
      "bg-glass-panel",
      THEME_SHELL_UTILITIES.border,
      THEME_SHELL_UTILITIES.text,
    )}
  >
    <Story />
  </aside>
);

function VariantSample({
  variant,
  label,
  className,
}: {
  variant: CardVariant;
  label: string;
  className?: string;
}) {
  return (
    <Card variant={variant} className={cn("p-4", className)}>
      <Text variant="bodyStrong">{label}</Text>
      <Text variant="caption" className="mt-1 block">
        variant={variant}
      </Text>
    </Card>
  );
}

const meta = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
  subcomponents: { CardHeader, CardContent },
  parameters: {
    layout: "centered",
    a11y: {
      config: {
        rules: [{ id: "color-contrast", enabled: true }],
      },
    },
  },
  args: {
    children: "Card content",
    variant: "panel",
    className: "p-4",
    onClick: fn(),
  },
  argTypes: {
    children: { control: "text", table: { category: "Content" } },
    variant: {
      control: "select",
      options: [...CARD_VARIANTS],
      table: { category: "Appearance" },
    },
    className: { control: "text", table: { category: "Layout" } },
    onClick: { action: "clicked", table: { category: "Actions" } },
  },
  decorators: [inAppShell],
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof Card>;

export const Playground: Story = {};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-full flex-col gap-3">
      {CARD_VARIANTS.map((variant) => (
        <VariantSample key={variant} variant={variant} label={variant} />
      ))}
    </div>
  ),
};

export const ProviderPanel: Story = {
  args: {
    variant: "panel",
    className: cn("p-4 shadow-panel", THEME_SHELL_UTILITIES.text),
    children: null,
  },
  render: (args) => (
    <Card variant={args.variant} className={args.className}>
      <Text as="p" variant="sectionTitle">
        {PROVIDER_PANEL_COPY.label}
      </Text>
      <Text variant="captionStrong" className="mt-1 block">
        {PROVIDER_PANEL_COPY.description}
      </Text>
    </Card>
  ),
};

export const AuthPanelLayout: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Card
      variant="panel"
      className={cn("p-4 shadow-panel-sm", THEME_SHELL_UTILITIES.text)}
    >
      <Text as="p" variant="sectionTitle">
        {AUTH_PANEL_COPY.title}
      </Text>
      <Card variant="panel" className="mt-4 px-4 py-3">
        <Text variant="caption">{AUTH_PANEL_COPY.modeLabel}</Text>
      </Card>
      <Card variant="panel" className="mt-4 px-4 py-3">
        <Text variant="bodyStrong">Thang Ho Quang</Text>
      </Card>
    </Card>
  ),
};

export const Success: Story = {
  args: {
    variant: "success",
    className: "p-4",
    children: "Request approved",
  },
};

export const Danger: Story = {
  args: {
    variant: "danger",
    className: "p-4",
    children: "Validation failed",
  },
};
