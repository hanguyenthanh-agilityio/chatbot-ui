import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

// Components
import { ChatEmptyState } from "@/components/chat/empty-state";
// Constants
import { CHAT_EMPTY_STATE_COPY } from "@/constants/chat";

describe("ChatEmptyState", () => {
  afterEach(() => {
    cleanup();
  });

  it("matches snapshot", () => {
    const { container } = render(<ChatEmptyState />);
    expect(container.firstElementChild?.outerHTML ?? "").toMatchSnapshot();
  });

  it("renders title and description from CHAT_EMPTY_STATE_COPY", () => {
    render(<ChatEmptyState />);

    expect(screen.getByText(CHAT_EMPTY_STATE_COPY.title)).toBeInTheDocument();
    expect(
      screen.getByText(CHAT_EMPTY_STATE_COPY.description),
    ).toBeInTheDocument();
  });
});
