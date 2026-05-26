import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ThreadSidebar } from "@/components/workspace/sidebar";
import { SIDEBAR_COPY } from "@/constants/app";
import {
  mockChatThread,
  mockThreadSidebarProps,
} from "@/mocks/workspace-sidebar";

function renderSidebar(
  overrides: Parameters<typeof mockThreadSidebarProps>[0] = {},
) {
  return render(<ThreadSidebar {...mockThreadSidebarProps(overrides)} />);
}

describe("ThreadSidebar", () => {
  afterEach(() => {
    cleanup();
  });

  it.each([
    ["single-thread", {}],
    [
      "multi-thread",
      {
        allThreads: [
          mockChatThread({ id: "thread-1", title: "Active chat" }),
          mockChatThread({
            id: "thread-2",
            title: "Older chat",
            provider: "ollama",
            updatedAt: "2026-05-19T08:00:00.000Z",
          }),
        ],
      },
    ],
    ["disabled", { disabled: true }],
    [
      "empty-active",
      {
        activeThread: mockChatThread({ messages: [] }),
      },
    ],
    ["header-actions", { headerActions: <button type="button">Theme</button> }],
    [
      "invalid-timestamp",
      {
        activeThread: mockChatThread({ updatedAt: "not-a-date" }),
      },
    ],
  ])("snapshot %s", (_id, overrides) => {
    const { container } = renderSidebar(overrides);
    expect(container.firstElementChild?.outerHTML ?? "").toMatchSnapshot();
  });

  it("calls sidebar handlers", async () => {
    const user = userEvent.setup();
    const onCreateThread = vi.fn();
    const onSwitchThread = vi.fn();
    const onDeleteThread = vi.fn();
    const active = mockChatThread({ id: "active", title: "Active chat" });
    const other = mockChatThread({ id: "other", title: "Other chat" });

    renderSidebar({
      activeThread: active,
      allThreads: [active, other],
      onCreateThread,
      onSwitchThread,
      onDeleteThread,
    });

    await user.click(
      screen.getByRole("button", { name: SIDEBAR_COPY.newChatLabel }),
    );
    expect(onCreateThread).toHaveBeenCalledTimes(1);

    await user.click(screen.getByText("Active chat"));
    expect(onSwitchThread).not.toHaveBeenCalled();

    await user.click(screen.getByText("Other chat"));
    expect(onSwitchThread).toHaveBeenCalledWith("other");

    const deleteButtons = screen.getAllByRole("button", {
      name: SIDEBAR_COPY.deleteChatLabel,
    });
    await user.click(deleteButtons[0]!);
    expect(onDeleteThread).toHaveBeenCalledWith("active");

    await user.click(deleteButtons[1]!);
    expect(onDeleteThread).toHaveBeenCalledWith("other");
  });

  it("handles empty updatedAt", () => {
    renderSidebar({
      activeThread: mockChatThread({ title: "No timestamp", updatedAt: "" }),
    });
    expect(screen.getByText("No timestamp")).toBeInTheDocument();
  });
});
