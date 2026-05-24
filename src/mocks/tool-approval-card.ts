import type { ComponentProps } from "react";
import { ToolApprovalCard } from "@/components/chat/tool-approval-card";
import { CHAT_TRANSCRIPT_COPY } from "@/constants/chat";

export type MockToolApprovalCardProps = ComponentProps<typeof ToolApprovalCard>;

const submitCopy = CHAT_TRANSCRIPT_COPY.toolApproval.submitRequest;

export function mockToolApprovalCardProps(
  overrides?: Partial<MockToolApprovalCardProps>,
): MockToolApprovalCardProps {
  return {
    title: submitCopy.title,
    description:
      "Annual leave from 2026-07-01 to 2026-07-03. Reason: Family trip.",
    confirmLabel: submitCopy.confirmLabel,
    cancelLabel: submitCopy.cancelLabel,
    onConfirm: () => {},
    onCancel: () => {},
    ...overrides,
  };
}
