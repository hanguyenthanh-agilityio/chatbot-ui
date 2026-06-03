import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

// Components
import { ToolOutputTable } from "@/components/chat/tool-output-table";

import { inChatTranscript } from "@/mocks/storybook";
import {
  mockBalanceTableProps,
  mockEmptyTableProps,
  mockMyRequestsTableProps,
} from "@/mocks/tool-output-table";

const meta = {
  title: "Chat/ToolOutputTable",
  component: ToolOutputTable,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Structured tool result table rendered inside assistant messages. Supports row selection, per-row actions, and empty state. Toggle **App theme** in the toolbar for light/dark tokens.",
      },
    },
    a11y: {
      config: {
        rules: [{ id: "color-contrast", enabled: true }],
      },
    },
  },
  decorators: [inChatTranscript],
  args: {
    ...mockBalanceTableProps(),
    onActionClick: fn(),
    disableActions: false,
  },
  argTypes: {
    onActionClick: {
      action: "row action clicked",
      description:
        "Fires with the action prompt when a row action button is pressed.",
      table: { category: "Actions" },
    },
    disableActions: {
      control: "boolean",
      description: "Disables row action buttons (e.g. while streaming).",
    },
    emptyLabel: { control: "text" },
    title: { control: "text" },
  },
} satisfies Meta<typeof ToolOutputTable>;

export default meta;

type Story = StoryObj<typeof ToolOutputTable>;

/** Leave balance columns (`leaveType|allowance|used|pending|remaining`). */
export const BalanceTable: Story = {
  args: mockBalanceTableProps(),
};

/** My requests with cancel row actions. */
export const MyRequestsTable: Story = {
  args: mockMyRequestsTableProps(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("My time-off requests")).toBeInTheDocument();
    await expect(canvas.getByText(/3 records|2 records/)).toBeTruthy();
  },
};

export const Empty: Story = {
  args: mockEmptyTableProps(),
};

export const DisabledActions: Story = {
  args: {
    ...mockMyRequestsTableProps(),
    disableActions: true,
  },
};

export const Playground: Story = {
  args: mockMyRequestsTableProps(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [firstRow] = canvas.getAllByRole("button");
    await userEvent.click(firstRow);
    await userEvent.click(
      await canvas.findByRole("button", { name: "Cancel request" }),
    );
  },
};
