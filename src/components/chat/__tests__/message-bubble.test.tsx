import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  MessageAvatar,
  MessageBubble,
  type MessageAvatarProps,
  type MessageBubbleProps,
} from "@/components/chat/message-bubble";

describe("MessageBubble", () => {
  afterEach(() => {
    cleanup();
  });

  it.each([
    ["user", { isUser: true, text: "How many leave days do I have left?" }],
    [
      "assistant",
      { isUser: false, text: "You have 12 annual days remaining." },
    ],
    [
      "assistant-placeholder",
      { isUser: false, placeholder: "Working on it..." },
    ],
    [
      "assistant-with-children",
      {
        isUser: false,
        text: "Summary",
        children: <p className="text-sm">Nested table area</p>,
      },
    ],
    [
      "assistant-full-width",
      {
        isUser: false,
        text: "Wide content",
        fullWidth: true,
      },
    ],
  ] as const satisfies ReadonlyArray<[string, MessageBubbleProps]>)(
    "matches snapshot (%s)",
    (_name, props) => {
      const { container } = render(<MessageBubble {...props} />);
      expect(container.firstElementChild?.outerHTML ?? "").toMatchSnapshot();
    },
  );
});

describe("MessageAvatar", () => {
  afterEach(() => {
    cleanup();
  });

  it.each([
    [
      "assistant",
      { initials: "EM", isUser: false } satisfies MessageAvatarProps,
    ],
    [
      "user-initials",
      {
        initials: "HN",
        isUser: true,
        avatarLabel: "Ha Nguyen avatar",
      } satisfies MessageAvatarProps,
    ],
    [
      "user-with-url",
      {
        initials: "HN",
        isUser: true,
        avatarUrl: "https://example.com/user.png",
        avatarLabel: "Ha Nguyen avatar",
        size: "md",
      } satisfies MessageAvatarProps,
    ],
  ] as const)(
    "matches snapshot (%s)",
    (_name, props) => {
      const { container } = render(<MessageAvatar {...props} />);
      expect(container.firstElementChild?.outerHTML ?? "").toMatchSnapshot();
    },
  );

  it("renders assistant avatar with default alt", () => {
    render(<MessageAvatar initials="EM" isUser={false} />);
    expect(screen.getByRole("img", { name: /Employee Assistant/i })).toBeInTheDocument();
  });
});
