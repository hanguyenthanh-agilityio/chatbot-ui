import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { LoadingIndicator } from "@/components/chat/loading-indicator";
import { APP_NAME } from "@/constants/app";

describe("LoadingIndicator", () => {
  afterEach(() => {
    cleanup();
  });

  it.each([
    ["default", {}],
    ["no-avatar", { showAvatar: false }],
    ["custom-label", { label: "Assign: Employee Agent" }],
  ] as const)("snapshot: %s", (_name, props) => {
    const { container } = render(<LoadingIndicator {...props} />);
    expect(container.firstElementChild?.outerHTML ?? "").toMatchSnapshot();
  });

  it("shows app name and default Thinking label", () => {
    render(<LoadingIndicator />);
    expect(screen.getByText(APP_NAME)).toBeInTheDocument();
    expect(screen.getByText("Thinking")).toBeInTheDocument();
  });

  it("uses a custom label when provided", () => {
    render(<LoadingIndicator label="  Fetching balance  " />);
    expect(screen.getByText("Fetching balance")).toBeInTheDocument();
  });
});
