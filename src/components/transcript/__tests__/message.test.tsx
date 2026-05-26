import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ChatMessage } from "@/components/transcript/message";
import {
  CHAT_TRANSCRIPT_COPY,
  MOCK_CHAT_SAMPLE_MESSAGES,
} from "@/constants/chat";
import {
  mockAssistantApprovalMessage,
  mockAssistantBalanceTableMessage,
  mockAssistantMutationSuccessMessage,
  mockAssistantTextMessage,
  mockAssistantThinkingMessage,
  mockChatMessageProps,
  mockUserChatMessage,
} from "@/mocks/chat-message";

describe("ChatMessage", () => {
  afterEach(() => {
    cleanup();
  });

  it.each([
    [
      "user",
      mockChatMessageProps(
        mockUserChatMessage(MOCK_CHAT_SAMPLE_MESSAGES.userLeaveBalance),
      ),
    ],
    [
      "assistant-text",
      mockChatMessageProps(
        mockAssistantTextMessage(MOCK_CHAT_SAMPLE_MESSAGES.assistantLeaveBalance),
      ),
    ],
    [
      "assistant-table",
      mockChatMessageProps(mockAssistantBalanceTableMessage()),
    ],
    [
      "assistant-approval",
      mockChatMessageProps(mockAssistantApprovalMessage()),
    ],
    [
      "assistant-success-split",
      mockChatMessageProps(mockAssistantMutationSuccessMessage()),
    ],
  ] as const)("snapshot: %s", (_name, props) => {
    const { container } = render(<ChatMessage {...props} />);
    expect(container.innerHTML).toMatchSnapshot();
  });

  it("calls onToolApproval when confirm or cancel is clicked", async () => {
    const user = userEvent.setup();
    const onToolApproval = vi.fn();
    const { confirmLabel, cancelLabel } =
      CHAT_TRANSCRIPT_COPY.toolApproval.submitRequest;

    render(
      <ChatMessage
        {...mockChatMessageProps(mockAssistantApprovalMessage(), {
          onToolApproval,
        })}
      />,
    );

    await user.click(screen.getByRole("button", { name: confirmLabel }));
    await user.click(screen.getByRole("button", { name: cancelLabel }));

    expect(onToolApproval).toHaveBeenNthCalledWith(
      1,
      "approval-submit-1",
      true,
    );
    expect(onToolApproval).toHaveBeenNthCalledWith(
      2,
      "approval-submit-1",
      false,
    );
  });

  it("hides tool table while the last assistant message is still loading", () => {
    render(
      <ChatMessage
        {...mockChatMessageProps(mockAssistantBalanceTableMessage(), {
          isLoading: true,
        })}
      />,
    );

    expect(screen.queryByText("My leave balance")).not.toBeInTheDocument();
  });

  it("shows error copy when the last assistant message has no renderable content", () => {
    render(
      <ChatMessage
        {...mockChatMessageProps(mockAssistantThinkingMessage(), {
          isLastMessage: true,
          isLoading: false,
        })}
      />,
    );

    expect(
      screen.getByText("Something went wrong. Please try again."),
    ).toBeInTheDocument();
  });
});
