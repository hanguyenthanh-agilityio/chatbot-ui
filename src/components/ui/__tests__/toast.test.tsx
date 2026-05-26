import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Toast } from "@/components/ui/toast";
import {
  TOAST_ARIA_DISMISS,
  TOAST_DEFAULT_DURATION_MS,
  TOAST_DEMO_MESSAGE,
  TOAST_EXIT_ANIMATION_MS,
  TOAST_VARIANTS,
} from "@/constants/toast";

describe("Toast", () => {
  const onDismiss = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    onDismiss.mockClear();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  function renderToast(
    overrides: Partial<{
      variant: (typeof TOAST_VARIANTS)[number];
      durationMs: number;
    }> = {},
  ) {
    return render(
      <Toast
        message={TOAST_DEMO_MESSAGE}
        onDismiss={onDismiss}
        {...overrides}
      />,
    );
  }

  function flushEnter() {
    act(() => {
      vi.advanceTimersToNextFrame();
    });
  }

  function flushExit() {
    act(() => {
      vi.advanceTimersByTime(TOAST_EXIT_ANIMATION_MS);
    });
  }

  it.each(TOAST_VARIANTS)("snapshot %s", (variant) => {
    renderToast({ variant });
    flushEnter();
    expect(screen.getByRole("status").outerHTML).toMatchSnapshot(variant);
  });

  it("auto-dismisses after duration and exit animation", () => {
    renderToast();
    flushEnter();

    act(() => {
      vi.advanceTimersByTime(TOAST_DEFAULT_DURATION_MS);
    });
    flushExit();

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("dismisses when the close button is clicked", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderToast();
    flushEnter();

    await user.click(screen.getByRole("button", { name: TOAST_ARIA_DISMISS }));
    flushExit();

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("cleans up timers on unmount", () => {
    const { unmount } = renderToast({ durationMs: 10_000 });
    flushEnter();
    unmount();

    act(() => {
      vi.advanceTimersByTime(20_000);
    });

    expect(onDismiss).not.toHaveBeenCalled();
  });
});
