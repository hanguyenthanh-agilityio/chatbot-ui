import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DateRangePickerCard } from "@/components/chat/date-range-picker-card";
import { mockDateRangePickerCardProps } from "@/mocks/date-range-picker-card";

const NOW = new Date("2026-05-20T12:00:00");

function expectMonthLabel(month: string, year: number) {
  expect(screen.getByText(`${month} ${year}`)).toBeInTheDocument();
}

function getPrevMonthButton() {
  return screen.getByRole("button", { name: "Previous month" });
}

function getNextMonthButton() {
  return screen.getByRole("button", { name: "Next month" });
}

async function advanceMonths(
  user: ReturnType<typeof userEvent.setup>,
  count: number,
) {
  for (let i = 0; i < count; i++) {
    await user.click(getNextMonthButton());
  }
}

describe("DateRangePickerCard", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it.each([
    ["default", {}],
    ["disabled", { disabled: true }],
  ] as const)("snapshot: %s", (_name, overrides) => {
    const { container } = render(
      <DateRangePickerCard {...mockDateRangePickerCardProps(overrides)} />,
    );
    expect(container.firstElementChild?.outerHTML ?? "").toMatchSnapshot();
  });

  it("submits all-day, half-day, and multi-day ranges", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onSubmit = vi.fn();
    render(
      <DateRangePickerCard {...mockDateRangePickerCardProps({ onSubmit })} />,
    );

    const confirm = () =>
      user.click(screen.getByRole("button", { name: "Confirm" }));
    const pickDay = (day: number) =>
      user.click(
        screen
          .getAllByRole("button")
          .find(
            (el) =>
              !el.getAttribute("aria-label") &&
              el.textContent?.trim() === String(day),
          )!,
      );
    const pickSlot = (name: "Morning" | "Afternoon") =>
      user.click(screen.getByRole("button", { name }));

    await confirm();
    expect(onSubmit).toHaveBeenLastCalledWith("2026-05-21 to 2026-05-21");

    await pickSlot("Morning");
    await confirm();
    expect(onSubmit).toHaveBeenLastCalledWith("morning of 2026-05-21");

    await pickSlot("Afternoon");
    await pickDay(28);
    await pickSlot("Morning");
    await confirm();
    expect(onSubmit).toHaveBeenLastCalledWith(
      "afternoon of 2026-05-21 to morning of 2026-05-28",
    );
  });

  it("resets range when picking a new start after a range", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onSubmit = vi.fn();
    render(
      <DateRangePickerCard {...mockDateRangePickerCardProps({ onSubmit })} />,
    );

    const pickDay = (day: number) =>
      user.click(
        screen
          .getAllByRole("button")
          .find(
            (el) =>
              !el.getAttribute("aria-label") &&
              el.textContent?.trim() === String(day),
          )!,
      );

    // 25 → extends range from default start (21); 28 → new cycle (start=28);
    // 22 → before 28, so start becomes 22 only (single day, not 22–28).
    await pickDay(25);
    await pickDay(28);
    await pickDay(22);
    await user.click(screen.getByRole("button", { name: "Confirm" }));

    // Single-day confirm format: same ISO date twice.
    expect(onSubmit).toHaveBeenLastCalledWith("2026-05-22 to 2026-05-22");
  });

  it("clears selection so slots hide until a day is picked", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<DateRangePickerCard {...mockDateRangePickerCardProps()} />);

    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(
      screen.queryByRole("button", { name: "Morning" }),
    ).not.toBeInTheDocument();

    await user.click(
      screen
        .getAllByRole("button")
        .find(
          (el) =>
            !el.getAttribute("aria-label") && el.textContent?.trim() === "25",
        )!,
    );
    expect(screen.getByRole("button", { name: "Confirm" })).toBeEnabled();
  });

  it("disables afternoon on the end boundary of a multi-day range", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<DateRangePickerCard {...mockDateRangePickerCardProps()} />);

    await user.click(
      screen
        .getAllByRole("button")
        .find(
          (el) =>
            !el.getAttribute("aria-label") && el.textContent?.trim() === "28",
        )!,
    );

    expect(screen.getByRole("button", { name: "Afternoon" })).toBeDisabled();
  });

  describe("month navigation (goMonth)", () => {
    it("wraps January to December of the previous year", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<DateRangePickerCard {...mockDateRangePickerCardProps()} />);
      await advanceMonths(user, 8);
      await user.click(getPrevMonthButton());
      expectMonthLabel("December", 2026);
    });
  });
});
