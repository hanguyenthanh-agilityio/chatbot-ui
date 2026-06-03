"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { RECENT_FLYOUT_LAYOUT } from "@/constants/file-attachment";
import { getRecentFlyoutPosition } from "@/utils/file-attachment";

/**
 * Manages the composer attach (+) menu: open/close, recent-files flyout on hover,
 * flyout position, and dismiss on outside click or Escape.
 * File picking is handled elsewhere (useComposerAttachment).
 */
export function useComposerAttachmentMenu() {
  // Stable ids for aria-controls and the portaled recent flyout.
  const menuId = useId();
  const recentMenuId = useId();

  // DOM anchors for hit-testing and positioning.
  const rootRef = useRef<HTMLDivElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const recentTriggerRef = useRef<HTMLDivElement>(null);
  const recentTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [isOpen, setIsOpen] = useState(false);
  const [isRecentOpen, setIsRecentOpen] = useState(false);
  const [recentFlyoutStyle, setRecentFlyoutStyle] = useState<CSSProperties>({});

  function clearRecentTimer() {
    const timer = recentTimerRef.current;
    if (timer) clearTimeout(timer);
    recentTimerRef.current = undefined;
  }

  const closeMenu = useCallback(() => {
    clearRecentTimer();
    setIsOpen(false);
    setIsRecentOpen(false);
  }, []);

  function toggleMenu() {
    setIsOpen((open) => {
      // Closing the main menu also hides the recent flyout.
      if (open) setIsRecentOpen(false);
      return !open;
    });
  }

  // Wire these to the "Recent files" row in the menu.
  const recentHover = {
    onEnter: () => {
      clearRecentTimer();
      setIsRecentOpen(true);
    },
    onLeave: () => {
      clearRecentTimer();
      // Short delay so the flyout does not flicker when moving the pointer.
      recentTimerRef.current = setTimeout(
        () => setIsRecentOpen(false),
        RECENT_FLYOUT_LAYOUT.hoverCloseDelayMs,
      );
    },
  };

  // Measure DOM before paint so the flyout does not jump.
  useLayoutEffect(() => {
    if (!isRecentOpen || !recentTriggerRef.current) return;
    setRecentFlyoutStyle(
      getRecentFlyoutPosition(recentTriggerRef.current, menuPanelRef.current),
    );
  }, [isRecentOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      // Recent flyout may be portaled outside rootRef.
      if (document.getElementById(recentMenuId)?.contains(target)) return;
      closeMenu();
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
      clearRecentTimer();
    };
  }, [isOpen, recentMenuId, closeMenu]);

  return {
    menuId,
    recentMenuId,
    rootRef,
    menuPanelRef,
    recentTriggerRef,
    isOpen,
    isRecentOpen,
    recentFlyoutStyle,
    closeMenu,
    toggleMenu,
    recentHover,
  };
}
