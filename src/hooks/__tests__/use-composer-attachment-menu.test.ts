import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useComposerAttachmentMenu } from "@/hooks/use-composer-attachment-menu";

describe("useComposerAttachmentMenu", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("toggles main menu open state", () => {
    const { result } = renderHook(() => useComposerAttachmentMenu());

    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.toggleMenu();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.closeMenu();
    });
    expect(result.current.isOpen).toBe(false);
    expect(result.current.isRecentOpen).toBe(false);
  });

  it("keeps stable toggleMenu and recentHover references", () => {
    const { result, rerender } = renderHook(() => useComposerAttachmentMenu());
    const firstToggle = result.current.toggleMenu;
    const firstHover = result.current.recentHover;

    rerender();

    expect(result.current.toggleMenu).toBe(firstToggle);
    expect(result.current.recentHover).toBe(firstHover);
  });

  it("opens and closes recent flyout via recentHover", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useComposerAttachmentMenu());

    act(() => {
      result.current.recentHover.onEnter();
    });
    expect(result.current.isRecentOpen).toBe(true);

    act(() => {
      result.current.recentHover.onLeave();
    });
    expect(result.current.isRecentOpen).toBe(true);

    act(() => {
      vi.advanceTimersByTime(120);
    });
    expect(result.current.isRecentOpen).toBe(false);
  });

  it("closes menu on Escape when open", () => {
    const { result } = renderHook(() => useComposerAttachmentMenu());

    act(() => {
      result.current.toggleMenu();
    });

    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });

    expect(result.current.isOpen).toBe(false);
  });
});
