import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn, userEvent, within } from "storybook/test";

import { ToolApprovalCard } from "@/components/chat/tool-approval-card";
import { CHAT_TRANSCRIPT_COPY } from "@/constants/chat";
import { inChatTranscript } from "../../../../.storybook/decorators";

const submitCopy = CHAT_TRANSCRIPT_COPY.toolApproval.submitRequest;

const meta = {
  title: "Chat/ToolApprovalCard",
  component: ToolApprovalCard,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Human-in-the-loop confirmation card shown when a tool requires approval before execution. Wired from `transcript/message.tsx` via `onConfirm` / `onCancel`.",
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
    title: submitCopy.title,
    description:
      "Annual leave from 2026-07-01 to 2026-07-03. Reason: Family trip.",
    confirmLabel: submitCopy.confirmLabel,
    cancelLabel: submitCopy.cancelLabel,
    onConfirm: fn(),
    onCancel: fn(),
  },
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    confirmLabel: { control: "text" },
    cancelLabel: { control: "text" },
    onConfirm: {
      action: "confirmed",
      table: { category: "Actions" },
    },
    onCancel: {
      action: "cancelled",
      table: { category: "Actions" },
    },
  },
} satisfies Meta<typeof ToolApprovalCard>;

export default meta;

type Story = StoryObj<typeof ToolApprovalCard>;

export const SubmitRequest: Story = {};

/** Card grows in height as description wraps; no inner scroll. */
export const LongDescription: Story = {
  args: {
    description: Array.from(
      { length: 4 },
      () =>
        "Annual leave from 2026-07-01 to 2026-07-03. Reason: Family trip.",
    ).join(" "),
  },
};

export const CancelRequest: Story = {
  args: {
    title: CHAT_TRANSCRIPT_COPY.toolApproval.cancelRequest.title,
    description: `${CHAT_TRANSCRIPT_COPY.toolApproval.cancelRequest.descriptionPrefix} Annual leave · Jun 10–12.`,
    confirmLabel: CHAT_TRANSCRIPT_COPY.toolApproval.cancelRequest.confirmLabel,
    cancelLabel: CHAT_TRANSCRIPT_COPY.toolApproval.cancelRequest.cancelLabel,
  },
};

export const ApproveTeamRequest: Story = {
  args: {
    title: CHAT_TRANSCRIPT_COPY.toolApproval.approveRequest.title,
    description: `${CHAT_TRANSCRIPT_COPY.toolApproval.approveRequest.descriptionPrefix} Mia Nguyen · sick leave · May 2.`,
    confirmLabel: CHAT_TRANSCRIPT_COPY.toolApproval.approveRequest.confirmLabel,
    cancelLabel: CHAT_TRANSCRIPT_COPY.toolApproval.approveRequest.cancelLabel,
  },
};

export const Playground: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: args.confirmLabel }),
    );
    await userEvent.click(
      canvas.getByRole("button", { name: args.cancelLabel }),
    );
  },
};
