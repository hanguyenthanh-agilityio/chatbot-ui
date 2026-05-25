import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DateRangePickerCard } from "@/components/chat/date-range-picker-card";
import { mockDateRangePickerCardProps } from "@/mocks/date-range-picker-card";

const FIXED_NOW = new Date("2026-05-20T12:00:00");

function dayButton(day: number) {
  return screen.getAllByRole("button").find(
    (el) =>
      !el.getAttribute("aria-label") && el.textContent?.trim() === String(day),
  );
}

function renderPicker(overrides?: Parameters<typeof mockDateRangePickerCardProps>[0]) {
  return render(<DateRangePickerCard {...mockDateRangePickerCardProps(overrides)} />);
}

describe("DateRangePickerCard", () => {
  beforeEach(() => vi.setSystemTime(FIXED_NOW));
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it.each([
    ["default", {}],
    ["disabled", { disabled: true }],
  ] as const)("matches snapshot (%s)", (_name, overrides) => {
    const { container } = renderPicker(overrides);
    expect(container.firstElementChild?.outerHTML ?? "").toMatchSnapshot();
  });

  it("matches snapshot when cleared", async () => {
    const user = userEvent.setup();
    const { container } = renderPicker();
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(container.firstElementChild?.outerHTML ?? "").toMatchSnapshot();
  });

  it("matches snapshot with morning selected", async () => {
    const user = userEvent.setup();
    const { container } = renderPicker();
    await user.click(screen.getByRole("button", { name: "Morning" }));
    expect(container.firstElementChild?.outerHTML ?? "").toMatchSnapshot();
  });

  it("submits single-day, half-day, and multi-day ranges", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderPicker({ onSubmit });

    await user.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onSubmit).toHaveBeenLastCalledWith("2026-05-21 to 2026-05-21");

    await user.click(screen.getByRole("button", { name: "Morning" }));
    await user.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onSubmit).toHaveBeenLastCalledWith("morning of 2026-05-21");

    await user.click(screen.getByRole("button", { name: "Afternoon" }));
    await user.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onSubmit).toHaveBeenLastCalledWith("afternoon of 2026-05-21");

    await user.click(screen.getByRole("button", { name: "Morning" }));
    await user.click(screen.getByRole("button", { name: "Morning" }));
    await user.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onSubmit).toHaveBeenLastCalledWith("2026-05-21 to 2026-05-21");

    await user.click(screen.getByRole("button", { name: "Afternoon" }));
    await user.click(dayButton(28)!);
    await user.click(screen.getByRole("button", { name: "Morning" }));
    await user.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onSubmit).toHaveBeenLastCalledWith(
      "afternoon of 2026-05-21 to morning of 2026-05-28",
    );
  });

  it("navigates months and updates day selection", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderPicker({ onSubmit });

    expect(screen.getByText("Select dates")).toBeInTheDocument();
    expect(screen.getByLabelText("Previous month")).toBeDisabled();
    await user.click(screen.getByLabelText("Next month"));
    expect(screen.getByText("June 2026")).toBeInTheDocument();
    await user.click(screen.getByLabelText("Previous month"));
    expect(screen.getByText("May 2026")).toBeInTheDocument();

    await user.click(dayButton(20)!);
    await user.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onSubmit).toHaveBeenLastCalledWith("2026-05-20 to 2026-05-20");

    await user.click(dayButton(25)!);
    await user.click(dayButton(28)!);
    await user.click(dayButton(22)!);
    await user.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onSubmit).toHaveBeenLastCalledWith("2026-05-22 to 2026-05-22");

    for (let i = 0; i < 8; i++) await user.click(screen.getByLabelText("Next month"));
    expect(screen.getByText("January 2027")).toBeInTheDocument();
    await user.click(screen.getByLabelText("Previous month"));
    expect(screen.getByText("December 2026")).toBeInTheDocument();
  });

  it("clears selection and allows picking a new start date", async () => {
    const user = userEvent.setup();
    renderPicker();
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.queryByRole("button", { name: "Morning" })).not.toBeInTheDocument();
    await user.click(dayButton(25)!);
    expect(screen.getByRole("button", { name: "Confirm" })).toBeEnabled();
  });

  it("keeps morning on one day and blocks invalid multi-day slots", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderPicker({ onSubmit });

    await user.click(screen.getByRole("button", { name: "Morning" }));
    await user.click(dayButton(28)!);
    await user.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onSubmit).toHaveBeenCalledWith("morning of 2026-05-21");

    cleanup();
    renderPicker();
    await user.click(dayButton(28)!);
    const afternoon = screen.getByRole("button", { name: "Afternoon" });
    expect(afternoon).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Morning" }));
    expect(afternoon).not.toHaveClass("border-white/30");
  });
});
