import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Input, type InputProps } from "@/components/ui/input";

const INPUT_LABEL = "Field";

describe("Input", () => {
  afterEach(() => {
    cleanup();
  });

  it.each([
    ["default", {}],
    ["subtle", { variant: "subtle" as const }],
    ["ghost", { variant: "ghost" as const }],
    ["error", { variant: "error" as const }],
    ["panel", { variant: "panel" as const }],
    ["sm", { controlSize: "sm" as const }],
    ["lg", { controlSize: "lg" as const }],
    ["fullWidth", { fullWidth: true }],
    ["disabled", { disabled: true }],
    ["custom-class", { className: "mt-2 uppercase" }],
  ] as const satisfies ReadonlyArray<[string, InputProps]>)(
    "snapshot %s",
    (_id, props) => {
      render(<Input aria-label={INPUT_LABEL} {...props} />);
      expect(
        screen.getByRole("textbox", { name: INPUT_LABEL }).outerHTML,
      ).toMatchSnapshot();
    },
  );

  it("calls onChange when typing", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input aria-label={INPUT_LABEL} onChange={onChange} />);

    await user.type(screen.getByRole("textbox", { name: INPUT_LABEL }), "a");

    expect(onChange).toHaveBeenCalled();
  });
});
