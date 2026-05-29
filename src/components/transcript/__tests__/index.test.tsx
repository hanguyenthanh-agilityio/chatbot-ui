import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ChatTranscript } from "@/components/transcript";
import { CHAT_EMPTY_STATE_COPY } from "@/constants/chat";
import {
  mockChatTranscriptProps,
  mockChatTranscriptWithMessages,
} from "@/mocks/chat-transcript";

describe("ChatTranscript", () => {
  afterEach(() => {
    cleanup();
  });

  it.each([
    ["empty", mockChatTranscriptProps({ containerRef: createRef() })],
    ["with-messages", mockChatTranscriptWithMessages()],
    [
      "loading-after-user",
      mockChatTranscriptProps({
        containerRef: createRef(),
        messages: mockChatTranscriptWithMessages().messages.slice(0, 1),
        isLoading: true,
      }),
    ],
  ] as const)("snapshot: %s", (_name, props) => {
    const { container } = render(<ChatTranscript {...props} />);
    expect(container.innerHTML).toMatchSnapshot();
  });

  it("renders empty state when there are no messages", () => {
    render(
      <ChatTranscript
        {...mockChatTranscriptProps({ containerRef: createRef() })}
      />,
    );
    expect(screen.getByText(CHAT_EMPTY_STATE_COPY.title)).toBeInTheDocument();
  });

  it("calls onSelectPrompt from a quick action", async () => {
    const user = userEvent.setup();
    const onSelectPrompt = vi.fn();

    render(
      <ChatTranscript
        {...mockChatTranscriptProps({
          containerRef: createRef(),
          onSelectPrompt,
        })}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Check balance" }));
    expect(onSelectPrompt).toHaveBeenCalledWith(
      "How many annual, sick, and personal leave days do I have left?",
    );
  });

  it("shows loading indicator when the last message is from the user", () => {
    const props = mockChatTranscriptProps({
      containerRef: createRef(),
      messages: mockChatTranscriptWithMessages().messages.slice(0, 1),
      isLoading: true,
    });

    render(<ChatTranscript {...props} />);
    expect(screen.getByText("Thinking")).toBeInTheDocument();
  });
});
