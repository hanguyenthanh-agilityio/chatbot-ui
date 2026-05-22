import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ToolApprovalCard } from "@/components/chat/tool-approval-card";
import { mockToolApprovalCardProps } from "@/mocks/tool-approval-card";

describe("ToolApprovalCard", () => {
  afterEach(() => {
    cleanup();
  });

  it.each([
    ["submit-request", mockToolApprovalCardProps()],
    [
      "custom-labels",
      mockToolApprovalCardProps({
        title: "Approve team request",
        description: "Approve team request: annual leave Jun 10–12.",
        confirmLabel: "Confirm approve",
        cancelLabel: "Dismiss",
      }),
    ],
  ] as const)("matches snapshot (%s)", (_name, props) => {
    const { container } = render(<ToolApprovalCard {...props} />);
    expect(container.firstElementChild?.outerHTML ?? "").toMatchSnapshot();
  });

  it("calls onConfirm when the primary button is clicked", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const props = mockToolApprovalCardProps({ onConfirm });

    render(<ToolApprovalCard {...props} />);
    await user.click(screen.getByRole("button", { name: props.confirmLabel }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when the secondary button is clicked", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const props = mockToolApprovalCardProps({ onCancel });

    render(<ToolApprovalCard {...props} />);
    await user.click(screen.getByRole("button", { name: props.cancelLabel }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
