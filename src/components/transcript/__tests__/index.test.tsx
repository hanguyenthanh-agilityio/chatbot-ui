import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";

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
