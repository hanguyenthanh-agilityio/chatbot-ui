import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Select, type SelectProps } from "@/components/ui/select";

const SELECT_LABEL = "Provider";

function renderSelect(
  props: SelectProps = {},
  options = (
    <>
      <option value="a">Option A</option>
      <option value="b">Option B</option>
    </>
  ),
) {
  return render(
    <Select aria-label={SELECT_LABEL} {...props}>
      {options}
    </Select>,
  );
}

describe("Select", () => {
  afterEach(() => {
    cleanup();
  });

  it.each([
    ["default", {}],
    ["subtle", { variant: "subtle" as const }],
    ["ghost", { variant: "ghost" as const }],
    ["panel", { variant: "panel" as const }],
    ["sm", { controlSize: "sm" as const }],
    ["lg", { controlSize: "lg" as const }],
    ["fullWidth", { fullWidth: true }],
    ["disabled", { disabled: true }],
    ["custom-class", { className: "mt-2 uppercase" }],
  ] as const satisfies ReadonlyArray<[string, SelectProps]>)(
    "snapshot %s",
    (_id, props) => {
      const { container } = renderSelect(props);
      expect(container.firstElementChild?.outerHTML ?? "").toMatchSnapshot();
    },
  );

  it("calls onChange when a new option is selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderSelect({ onChange });

    await user.selectOptions(
      screen.getByRole("combobox", { name: SELECT_LABEL }),
      "b",
    );

    expect(onChange).toHaveBeenCalled();
  });
});
