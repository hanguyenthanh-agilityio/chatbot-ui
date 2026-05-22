import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { APP_ASSISTANT_AVATAR_ALT } from "@/constants/app";
import { Avatar, AVATAR_SIZE_OPTIONS } from "@/components/ui/avatar";

describe("Avatar", () => {
  afterEach(() => {
    cleanup();
  });

  it.each(
    AVATAR_SIZE_OPTIONS.map(
      (size) =>
        [`assistant-${size}`, { variant: "assistant" as const, size }] as const,
    ),
  )("matches snapshot (%s)", (_name, props) => {
    render(<Avatar {...props} />);
    expect(screen.getByRole("img", { name: APP_ASSISTANT_AVATAR_ALT }).outerHTML).toMatchSnapshot();
  });

  it.each(
    AVATAR_SIZE_OPTIONS.map(
      (size) =>
        [
          `user-initials-${size}`,
          {
            variant: "user" as const,
            alt: "Test user",
            initials: "TH",
            size,
          },
        ] as const,
    ),
  )("matches snapshot (%s)", (_name, props) => {
    render(<Avatar {...props} />);
    expect(screen.getByRole("img", { name: "Test user" }).outerHTML).toMatchSnapshot();
  });

  it("matches snapshot (user with image)", () => {
    render(
      <Avatar
        variant="user"
        src="https://example.com/avatar.png"
        alt="Photo user"
        initials="PH"
        size="md"
      />,
    );
    expect(screen.getByRole("img", { name: "Photo user" }).outerHTML).toMatchSnapshot();
  });

  it("matches snapshot (custom class)", () => {
    render(
      <Avatar
        variant="assistant"
        size="md"
        className="ring-2 ring-violet-400"
      />,
    );
    expect(screen.getByRole("img", { name: APP_ASSISTANT_AVATAR_ALT }).outerHTML).toMatchSnapshot();
  });
});
