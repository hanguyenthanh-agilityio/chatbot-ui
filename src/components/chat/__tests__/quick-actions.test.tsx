import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

// Components
import { ChatQuickActions } from "@/components/chat/quick-actions";

// Constants
import { QUICK_ACTIONS_BY_ROLE } from "@/constants/chat";

describe("ChatQuickActions", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders a button for each quick action", () => {
    const quickActions = QUICK_ACTIONS_BY_ROLE.user;
    render(
      <ChatQuickActions
        quickActions={quickActions}
        onSelectPrompt={() => {}}
      />,
    );

    for (const action of quickActions) {
      expect(
        screen.getByRole("button", { name: action.label }),
      ).toBeInTheDocument();
    }
  });

  it("calls onSelectPrompt with the action prompt when a chip is clicked", async () => {
    const user = userEvent.setup();
    const onSelectPrompt = vi.fn();
    const quickActions = QUICK_ACTIONS_BY_ROLE.user;

    render(
      <ChatQuickActions
        quickActions={quickActions}
        onSelectPrompt={onSelectPrompt}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: quickActions[0]!.label }),
    );

    expect(onSelectPrompt).toHaveBeenCalledTimes(1);
    expect(onSelectPrompt).toHaveBeenCalledWith(quickActions[0]!.prompt);
  });

  it("renders nothing when there are no quick actions", () => {
    const { container } = render(
      <ChatQuickActions quickActions={[]} onSelectPrompt={() => {}} />,
    );

    expect(container.firstChild).toBeNull();
  });
});
