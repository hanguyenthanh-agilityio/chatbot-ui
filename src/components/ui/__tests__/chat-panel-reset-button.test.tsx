import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ChatPanelResetButton } from "@/components/ui/chat-panel-reset-button";
import { CHAT_PANEL_RESET_COPY } from "@/constants/chat";

describe("ChatPanelResetButton", () => {
  afterEach(() => {
    cleanup();
  });

  it.each([
    ["default", {}],
    ["disabled", { disabled: true }],
    ["custom-class", { className: "mt-1" }],
  ])("matches snapshot (%s)", (_name, props) => {
    render(<ChatPanelResetButton {...props} />);
    expect(
      screen.getByRole("button", { name: CHAT_PANEL_RESET_COPY.ariaLabel })
        .outerHTML,
    ).toMatchSnapshot();
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ChatPanelResetButton onClick={onClick} />);
    await user.click(
      screen.getByRole("button", { name: CHAT_PANEL_RESET_COPY.ariaLabel }),
    );
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ChatPanelResetButton disabled onClick={onClick} />);
    await user.click(
      screen.getByRole("button", { name: CHAT_PANEL_RESET_COPY.ariaLabel }),
    );
    expect(onClick).not.toHaveBeenCalled();
  });
});
