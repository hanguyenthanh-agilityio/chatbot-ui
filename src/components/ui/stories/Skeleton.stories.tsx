import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Skeleton } from "@/components/ui/skeleton";
import { STORYBOOK_INLINE_CANVAS_PARAMETERS } from "@/constants/storybook";

const meta = {
  title: "UI/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  parameters: {
    ...STORYBOOK_INLINE_CANVAS_PARAMETERS,
    docs: {
      description: {
        component:
          "Pulse placeholder bars. Used inside `LoadingIndicator` and anywhere a loading shimmer is needed. Toggle **App theme** for light/dark.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="inline-flex w-64 flex-col gap-2 rounded-2xl border border-white/10 bg-glass-panel p-6 text-white light:border-app-border">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Skeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-2.5 w-full rounded-full" />
      <Skeleton className="h-2.5 w-4/5 rounded-full" />
      <Skeleton className="h-2.5 w-3/5 rounded-full" />
    </div>
  ),
};

export const Block: Story = {
  args: { className: "h-16 w-full rounded-xl" },
};
