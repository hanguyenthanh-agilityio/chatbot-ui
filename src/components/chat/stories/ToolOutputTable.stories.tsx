import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ToolOutputTable } from "@/components/chat/tool-output-table";
import {
  STORYBOOK_THEME_GLOBAL,
  THEME_SHELL_CLASSES,
  ThemeMode,
} from "@/constants/theme";
import {
  mockBalanceTableProps,
  mockEmptyTableProps,
  mockMyRequestsTableProps,
} from "@/mocks/tool-output-table";
import { cn } from "@/utils/class-name";

const inChatTranscript: Decorator = (Story) => (
  <section
    className={cn(
      THEME_SHELL_CLASSES.chatPanel,
      "mx-auto w-full max-w-3xl rounded-shell border p-6 shadow-shell-panel",
      "bg-glass-panel-chat border-white/9 light:border-app-border-9",
    )}
  >
    <Story />
  </section>
);

const meta = {
  title: "Chat/ToolOutputTable",
  component: ToolOutputTable,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
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
