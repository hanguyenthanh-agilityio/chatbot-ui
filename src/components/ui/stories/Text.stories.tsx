import type { Meta, StoryObj } from "@storybook/nextjs-vite";

// Components
import { Text } from "@/components/ui/text";
import { TEXT_VARIANT_OPTIONS } from "@/constants/text";
import type { TextVariant } from "@/types/text";
import { inStorybookUiPanel } from "@sb/decorators";
import { STORYBOOK_INLINE_CANVAS_PARAMETERS } from "@/constants/storybook";

function VariantGrid({
  variants = TEXT_VARIANT_OPTIONS,
  sample = (variant) => variant,
}: {
  variants?: TextVariant[];
  sample?: (variant: TextVariant) => string;
}) {
  return (
    <div className="flex max-w-md flex-col gap-3">
      {variants.map((variant) => (
        <Text key={variant} variant={variant}>
          {sample(variant)}
        </Text>
      ))}
    </div>
  );
}

const meta = {
  title: "UI/Text",
  component: Text,
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
    children: "Sample text",
    variant: "body",
    as: "p",
    className: "",
  },
  argTypes: {
    children: { control: "text", table: { category: "Content" } },
    variant: {
      control: "select",
      options: TEXT_VARIANT_OPTIONS,
      table: { category: "Appearance" },
    },
    as: {
      control: "select",
      options: ["p", "span", "label", "h1", "h2", "h3"],
      table: { category: "HTML" },
    },
    className: { control: "text", table: { category: "Appearance" } },
  },
  decorators: [inStorybookUiPanel],
} satisfies Meta<typeof Text>;

export default meta;

type Story = StoryObj<typeof Text>;

export const Playground: Story = {};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => <VariantGrid />,
};

export const SemanticHeadings: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="space-y-2">
      <Text as="h1" variant="display">
        Display
      </Text>
      <Text as="h2" variant="title">
        Title
      </Text>
      <Text variant="subtitle">Subtitle for section context</Text>
    </div>
  ),
};

export const Status: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="space-y-2">
      <Text variant="error">Something went wrong.</Text>
      <Text variant="warning">Review before continuing.</Text>
    </div>
  ),
};
