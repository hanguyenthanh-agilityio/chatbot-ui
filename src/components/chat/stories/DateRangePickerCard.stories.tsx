import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn, userEvent, within } from "storybook/test";

import { DateRangePickerCard } from "@/components/chat/date-range-picker-card";
import { inChatTranscript } from "../../../../.storybook/decorators";

const meta = {
  title: "Chat/DateRangePickerCard",
  component: DateRangePickerCard,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Inline date-range picker for time-off tool flows. Supports single/multi-day selection and morning/afternoon half-day slots. Toggle **App theme** for light/dark.",
      },
    },
  },
  decorators: [inChatTranscript],
  args: {
    onSubmit: fn(),
    disabled: false,
  },
  argTypes: {
    onSubmit: { action: "submit", table: { category: "Actions" } },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof DateRangePickerCard>;

export default meta;

type Story = StoryObj<typeof DateRangePickerCard>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const ConfirmSingleDay: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Confirm" }));
  },
};

export const SelectMorningSlot: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Morning" }));
    await userEvent.click(canvas.getByRole("button", { name: "Confirm" }));
  },
};
