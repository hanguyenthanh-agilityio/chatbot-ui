"use client";

import { useEffect, useState } from "react";

import {
  TOAST_ARIA_DISMISS,
  TOAST_DEFAULT_DURATION_MS,
  TOAST_EXIT_ANIMATION_MS,
  TOAST_HIDDEN_CLASS,
  TOAST_VARIANTS,
  TOAST_VISIBLE_CLASS,
} from "@/constants/toast";

export type ToastVariant = (typeof TOAST_VARIANTS)[number];

type ToastProps = {
  message: string;
  variant?: ToastVariant;
  durationMs?: number;
  onDismiss: () => void;
};

const ICON_BY_VARIANT: Record<ToastVariant, string> = {
  success: "✓",
  error: "✕",
  info: "ℹ",
};

const STYLE_BY_VARIANT: Record<ToastVariant, string> = {
  success:
    "border-emerald-500/30 bg-emerald-500/12 text-emerald-300 shadow-toast-success",
  error: "border-red-500/30 bg-red-500/12 text-red-300 shadow-toast-error",
  info: "border-sky-500/30 bg-sky-500/12 text-sky-300 shadow-toast-info",
};

const ICON_BG_BY_VARIANT: Record<ToastVariant, string> = {
  success: "bg-emerald-500/20 text-emerald-400",
  error: "bg-red-500/20 text-red-400",
  info: "bg-sky-500/20 text-sky-400",
};

export function Toast({
  message,
  variant = "success",
  durationMs = TOAST_DEFAULT_DURATION_MS,
  onDismiss,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger enter animation on next frame.
    const enterFrame = requestAnimationFrame(() => setIsVisible(true));

    const dismissTimer = setTimeout(() => {
      setIsLeaving(true);
      // Wait for exit animation before unmounting.
      setTimeout(onDismiss, TOAST_EXIT_ANIMATION_MS);
    }, durationMs);

    return () => {
      cancelAnimationFrame(enterFrame);
      clearTimeout(dismissTimer);
    };
  }, [durationMs, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        "fixed right-5 top-5 z-[9999] flex max-w-sm items-center gap-3 rounded-2xl border px-4 py-3 backdrop-blur-xl transition-all duration-280",
        STYLE_BY_VARIANT[variant],
        isVisible && !isLeaving ? TOAST_VISIBLE_CLASS : TOAST_HIDDEN_CLASS,
      ].join(" ")}
    >
      <span
        className={[
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
          ICON_BG_BY_VARIANT[variant],
        ].join(" ")}
      >
        {ICON_BY_VARIANT[variant]}
      </span>
      <span className="text-sm font-medium leading-snug">{message}</span>
      <button
        type="button"
        className="ml-auto shrink-0 rounded-lg p-1 opacity-60 transition hover:opacity-100"
        onClick={() => {
          setIsLeaving(true);
          setTimeout(onDismiss, TOAST_EXIT_ANIMATION_MS);
        }}
        aria-label={TOAST_ARIA_DISMISS}
      >
        ✕
      </button>
    </div>
  );
}
