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
  display:
    "font-syne text-3xl font-bold tracking-tight text-white light:text-app-fg",
  title: "font-syne text-2xl font-bold text-white light:text-app-fg",
  eyebrow:
    "font-syne text-xs font-semibold uppercase tracking-[0.2em] text-white/55 light:text-app-muted-55",
  eyebrowMuted:
    "font-syne text-xs font-semibold uppercase tracking-[0.2em] text-white/50 light:text-app-muted-50",
  sectionTitle:
    "font-syne text-sm font-semibold text-white/80 light:text-app-fg-muted",
  subtitle:
    "font-dm-sans text-[15px] leading-7 text-white/70 light:text-app-muted-70",
  body: "font-dm-sans text-sm text-white/80 light:text-app-fg-muted",
  bodyStrong:
    "font-dm-sans text-sm font-medium text-white/80 light:text-app-fg-muted",
  muted: "font-dm-sans text-sm text-white/65 light:text-app-muted-65",
  caption: "font-dm-sans text-xs text-white/60 light:text-app-muted-60",
  captionStrong: "font-dm-sans text-xs text-white/65 light:text-app-muted-65",
  captionMuted: "font-dm-sans text-xs text-white/55 light:text-app-muted-55",
  helper: "font-dm-sans text-[11px] text-white/50 light:text-app-muted-50",
  inherit: "text-sm text-inherit",
  error: "font-dm-sans text-sm text-red-400",
  warning: "font-dm-sans text-xs text-amber-400",
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
