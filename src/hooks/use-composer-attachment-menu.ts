"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";

const RECENT_CLOSE_DELAY_MS = 120;
const RECENT_FLYOUT_WIDTH = 280;
const RECENT_FLYOUT_MAX_HEIGHT = 320;
const RECENT_FLYOUT_GAP = 6;
const VIEWPORT_PADDING = 8;

const portalSubscribe = () => () => {};
const getPortalSnapshot = () => typeof document !== "undefined";
const getServerPortalSnapshot = () => false;

function positionRecentFlyout(
  recentRow: HTMLElement,
  menuPanel: HTMLElement | null,
): CSSProperties {
  const rowRect = recentRow.getBoundingClientRect();
  const menuRect = menuPanel?.getBoundingClientRect();

  let left = (menuRect?.right ?? rowRect.right) + RECENT_FLYOUT_GAP;
  if (left + RECENT_FLYOUT_WIDTH > window.innerWidth - VIEWPORT_PADDING) {
    left =
      (menuRect?.left ?? rowRect.left) - RECENT_FLYOUT_WIDTH - RECENT_FLYOUT_GAP;
  }

  let top = menuRect?.top ?? rowRect.top;
  if (top + RECENT_FLYOUT_MAX_HEIGHT > window.innerHeight - VIEWPORT_PADDING) {
    top = Math.max(
      VIEWPORT_PADDING,
      window.innerHeight - RECENT_FLYOUT_MAX_HEIGHT - VIEWPORT_PADDING,
    );
  }

  return { top, left };
}

export function useComposerAttachmentMenu() {
  const menuId = useId();
  const recentMenuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const recentTriggerRef = useRef<HTMLDivElement>(null);
  const recentCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isRecentOpen, setIsRecentOpen] = useState(false);
  const [recentFlyoutStyle, setRecentFlyoutStyle] = useState<CSSProperties>({});
  const canUsePortal = useSyncExternalStore(
    portalSubscribe,
    getPortalSnapshot,
    getServerPortalSnapshot,
  );

  const clearRecentCloseTimer = useCallback(() => {
    if (recentCloseTimerRef.current) {
      clearTimeout(recentCloseTimerRef.current);
      recentCloseTimerRef.current = null;
    }
  }, []);

  const closeMenu = useCallback(() => {
    clearRecentCloseTimer();
    setIsOpen(false);
    setIsRecentOpen(false);
  }, [clearRecentCloseTimer]);

  const openRecent = useCallback(() => {
    clearRecentCloseTimer();
    setIsRecentOpen(true);
  }, [clearRecentCloseTimer]);

  const scheduleCloseRecent = useCallback(() => {
    clearRecentCloseTimer();
    recentCloseTimerRef.current = setTimeout(
      () => setIsRecentOpen(false),
      RECENT_CLOSE_DELAY_MS,
    );
  }, [clearRecentCloseTimer]);

  const toggleMenu = useCallback(() => {
    setIsOpen((open) => {
      if (open) setIsRecentOpen(false);
      return !open;
    });
  }, []);

  useEffect(() => () => clearRecentCloseTimer(), [clearRecentCloseTimer]);

  useLayoutEffect(() => {
    if (!isRecentOpen || !recentTriggerRef.current) return;
    setRecentFlyoutStyle(
      positionRecentFlyout(recentTriggerRef.current, menuPanelRef.current),
    );
  }, [isRecentOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (document.getElementById(recentMenuId)?.contains(target)) return;
      closeMenu();
    }

    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") closeMenu();
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
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
    canUsePortal,
    closeMenu,
    openRecent,
    scheduleCloseRecent,
    toggleMenu,
  };
}
