import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/utils/class-name";

/**
 * Semantic text variants for the dark theme.
 * Update a variant here and every usage in the app updates automatically.
 *
 * Hierarchy:
 *   display / title      — Syne, large headings, full white
 *   eyebrow / sectionTitle — Syne, labels and panel headings
 *   subtitle / body      — DM Sans, primary content copy
 *   muted / caption      — DM Sans, secondary/supporting copy
 *   helper               — DM Sans, tiny disclaimers / helper text
 *   inherit / error / warning — special-purpose
 */
const TEXT_VARIANT_CLASSES = {
  // ── Headings (Syne) ──────────────────────────────────────────────────────
  display: "font-primary text-3xl font-bold tracking-tight text-white",
  title: "font-primary text-2xl font-bold text-white",
  /** Uppercase section label: "EMPLOYEE ASSISTANT", "CURRENT CHAT" */
  eyebrow:
    "font-primary text-xs font-semibold uppercase tracking-[0.2em] text-white/55",
  /** Quiet uppercase section label */
  eyebrowMuted:
    "font-primary text-xs font-semibold uppercase tracking-[0.2em] text-white/50",
  /** Panel / card heading: "User mode selection", "Provider" */
  sectionTitle: "font-primary text-sm font-semibold text-white/80",

  // ── Body copy (DM Sans) ──────────────────────────────────────────────────
  /** Long-form subtitle under a heading */
  subtitle: "text-[15px] leading-7 text-white/70",
  /** Default body text */
  body: "text-sm text-white/80",
  /** Emphasized body text (same size, stronger weight) */
  bodyStrong: "text-sm font-medium text-white/80",
  /** One step quieter than body — descriptions, secondary info */
  muted: "text-sm text-white/65",
  /** Small supporting text — timestamps, previews, labels */
  caption: "text-xs text-white/60",
  /** Small supporting text with stronger contrast */
  captionStrong: "text-xs text-white/65",
  /** Small supporting text with softer contrast */
  captionMuted: "text-xs text-white/55",
  /** Tiny disclaimer / hint text under inputs */
  helper: "text-[11px] text-white/50",

  // ── Special-purpose ──────────────────────────────────────────────────────
  /** Inherits color from parent — useful inside colored containers */
  inherit: "text-sm text-inherit",
  error: "text-sm text-red-400",
  warning: "text-xs text-amber-400",
} as const;

type TextVariant = keyof typeof TEXT_VARIANT_CLASSES;

type TextProps<T extends ElementType> = {
  as?: T;
  variant?: TextVariant;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className">;

export function Text<T extends ElementType = "p">({
  as,
  variant = "body",
  className,
  ...props
}: TextProps<T>) {
  const Component = as ?? "p";

  return (
    <Component
      className={cn(TEXT_VARIANT_CLASSES[variant], className)}
      {...props}
    />
  );
}
