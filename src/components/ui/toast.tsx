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
import { cn } from "@/utils/class-name";

export type ToastVariant = (typeof TOAST_VARIANTS)[number];

type ToastLayout = "fixed" | "inline";

type ToastProps = {
  message: string;
  variant?: ToastVariant;
  durationMs?: number;
  /** `fixed` = app overlay (default). `inline` = in-flow (Storybook). */
  layout?: ToastLayout;
  onDismiss: () => void;
};

const ICON_BY_VARIANT: Record<ToastVariant, string> = {
  success: "✓",
  error: "✕",
  info: "ℹ",
};

const STYLE_BY_VARIANT: Record<ToastVariant, string> = {
  success:
    "border border-emerald-400/28 bg-emerald-500/12 text-emerald-100 shadow-toast-success light:border-app-success-border light:bg-app-success-bg light:text-app-success-fg light:shadow-panel-sm",
  error:
    "border border-rose-400/28 bg-rose-500/12 text-rose-200 shadow-toast-error light:border-app-danger-border light:bg-app-danger-bg light:text-app-danger-fg light:shadow-panel-sm",
  info: "border border-cyan-400/28 bg-cyan-500/12 text-cyan-100 shadow-toast-info light:border-app-info-border light:bg-app-info-bg light:text-app-info-fg light:shadow-panel-sm",
};

const ICON_BG_BY_VARIANT: Record<ToastVariant, string> = {
  success:
    "bg-emerald-500/25 text-emerald-200 light:bg-app-success-bg light:text-app-success-fg",
  error:
    "bg-rose-500/25 text-rose-200 light:bg-app-danger-bg light:text-app-danger-fg",
  info: "bg-cyan-500/25 text-cyan-200 light:bg-app-info-bg light:text-app-info-fg",
};

const TOAST_SHELL_BASE_CLASSES =
  "flex max-w-sm items-center gap-3 rounded-2xl border px-4 py-3 font-secondary backdrop-blur-xl transition-all duration-280";

const TOAST_SHELL_LAYOUT_CLASSES: Record<ToastLayout, string> = {
  fixed: "fixed right-5 top-5 z-[9999]",
  inline: "relative z-0 w-max max-w-full",
};

const TOAST_DISMISS_BUTTON_CLASSES =
  "ml-auto shrink-0 cursor-pointer rounded-lg p-1 opacity-60 transition hover:bg-white/10 hover:opacity-100 light:hover:bg-app-hover";

export function Toast({
  message,
  variant = "success",
  durationMs = TOAST_DEFAULT_DURATION_MS,
  layout = "fixed",
  onDismiss,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger enter animation on next frame.
    const enterFrame = requestAnimationFrame(() => setIsVisible(true));

    let dismissTimer: ReturnType<typeof setTimeout> | undefined;
    let exitTimer: ReturnType<typeof setTimeout> | undefined;

    if (durationMs > 0) {
      dismissTimer = setTimeout(() => {
        setIsLeaving(true);
        exitTimer = setTimeout(onDismiss, TOAST_EXIT_ANIMATION_MS);
      }, durationMs);
    }

    return () => {
      cancelAnimationFrame(enterFrame);
      if (dismissTimer) clearTimeout(dismissTimer);
      if (exitTimer) clearTimeout(exitTimer);
    };
  }, [durationMs, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        TOAST_SHELL_BASE_CLASSES,
        TOAST_SHELL_LAYOUT_CLASSES[layout],
        STYLE_BY_VARIANT[variant],
        isVisible && !isLeaving ? TOAST_VISIBLE_CLASS : TOAST_HIDDEN_CLASS,
      )}
    >
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
          ICON_BG_BY_VARIANT[variant],
        )}
      >
        {ICON_BY_VARIANT[variant]}
      </span>
      <span className="text-sm font-medium leading-snug">{message}</span>
      <button
        type="button"
        className={TOAST_DISMISS_BUTTON_CLASSES}
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
