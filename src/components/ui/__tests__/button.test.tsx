import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

// Components
import { Button } from "@/components/ui/button";

describe("Button", () => {
  afterEach(() => {
    cleanup();
  });

  it.each([
    ["default", {}],
    ["danger", { variant: "danger" as const }],
    ["sm", { size: "sm" as const }],
    ["custom-class", { className: "mt-2 uppercase" }],
    ["fullWidth", { fullWidth: true }],
    ["disabled", { disabled: true }],
    ["loading", { isLoading: true }],
  ])("matches snapshot (%s)", (_name, props) => {
    render(<Button {...props}>Label</Button>);
    expect(
      screen.getByRole("button", { name: "Label" }).outerHTML,
    ).toMatchSnapshot();
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    await user.click(screen.getByRole("button", { name: "Click me" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Blocked
      </Button>,
    );
    await user.click(screen.getByRole("button", { name: "Blocked" }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
