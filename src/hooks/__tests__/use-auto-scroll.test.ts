import { renderHook } from "@testing-library/react";
import type { UIMessage } from "ai";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useChatAutoScroll } from "@/hooks/use-auto-scroll";

const messages: UIMessage[] = [{ id: "m1", role: "user", parts: [] }];

function createScrollContainer() {
  const element = document.createElement("div");
  Object.defineProperty(element, "scrollHeight", {
    value: 480,
    configurable: true,
  });
  element.scrollTo = vi.fn();
  return element;
}

describe("useChatAutoScroll", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does nothing when the container ref is unset", () => {
    const containerRef = createRef<HTMLElement | null>();

    renderHook(() => useChatAutoScroll(containerRef, messages, false));

    expect(containerRef.current).toBeNull();
  });

  it("scrolls to the bottom with smooth behavior, then auto while streaming", () => {
    const container = createScrollContainer();
    const containerRef = { current: container };

    const { rerender } = renderHook(
      ({ isStreaming }) =>
        useChatAutoScroll(containerRef, messages, isStreaming),
      { initialProps: { isStreaming: false } },
    );

    expect(container.scrollTo).toHaveBeenCalledWith({
      top: 480,
      behavior: "smooth",
    });

    rerender({ isStreaming: true });

    expect(container.scrollTo).toHaveBeenLastCalledWith({
      top: 480,
      behavior: "auto",
    });
  });
});
