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
      if (open) setIsRecentOpen(false);
      return !open;
    });
  }

  const recentHover = {
    onEnter: () => {
      clearRecentTimer();
      setIsRecentOpen(true);
    },
    onLeave: () => {
      clearRecentTimer();
      recentTimerRef.current = setTimeout(
        () => setIsRecentOpen(false),
        RECENT_FLYOUT_LAYOUT.hoverCloseDelayMs,
      );
    },
  };

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
