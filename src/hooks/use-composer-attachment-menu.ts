"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
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
  const menuId = useId();
  const recentMenuId = useId();

  const rootRef = useRef<HTMLDivElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const recentTriggerRef = useRef<HTMLDivElement>(null);
  const recentTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [isOpen, setIsOpen] = useState(false);
  const [isRecentOpen, setIsRecentOpen] = useState(false);
  const [recentFlyoutStyle, setRecentFlyoutStyle] = useState<CSSProperties>({});

  const clearRecentTimer = useCallback(() => {
    const timer = recentTimerRef.current;
    if (timer) clearTimeout(timer);
    recentTimerRef.current = undefined;
  }, []);

  const closeMenu = useCallback(() => {
    clearRecentTimer();
    setIsOpen(false);
    setIsRecentOpen(false);
  }, [clearRecentTimer]);

  const toggleMenu = useCallback(() => {
    setIsOpen((open) => {
      if (open) setIsRecentOpen(false);
      return !open;
    });
  }, []);

  const openRecentFlyout = useCallback(() => {
    clearRecentTimer();
    setIsRecentOpen(true);
  }, [clearRecentTimer]);

  const closeRecentFlyout = useCallback(() => {
    clearRecentTimer();
    recentTimerRef.current = setTimeout(
      () => setIsRecentOpen(false),
      RECENT_FLYOUT_LAYOUT.hoverCloseDelayMs,
    );
  }, [clearRecentTimer]);

  const recentHover = useMemo(
    () => ({
      onEnter: openRecentFlyout,
      onLeave: closeRecentFlyout,
    }),
    [openRecentFlyout, closeRecentFlyout],
  );

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
  }, [isOpen, recentMenuId, closeMenu, clearRecentTimer]);

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
