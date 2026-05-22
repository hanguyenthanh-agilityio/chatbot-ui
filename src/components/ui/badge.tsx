import type { HTMLAttributes } from "react";
import { cn } from "@/utils/class-name";

const BADGE_VARIANT_CLASSES = {
  neutral:
    "app-badge-neutral border-white/20 bg-white/8 text-white/80 light:border-app-border light:bg-app-surface-muted light:text-app-fg-muted",
  subtle:
    "app-badge-subtle border-white/16 bg-white/5 text-white/62 light:border-app-border-subtle light:bg-app-surface-subtle light:text-app-fg-quaternary",
  brand:
    "app-badge-brand border-violet-400/35 bg-violet-500/16 text-violet-200 light:border-amber-300/70 light:bg-amber-50 light:text-amber-950",
  providerOllama:
    "app-badge-provider-ollama border-violet-400/35 bg-violet-500/16 text-violet-200 light:border-stone-300/80 light:bg-stone-100 light:text-stone-800",
  providerOpenai:
    "app-badge-provider-openai border-emerald-400/35 bg-emerald-500/15 text-emerald-100 light:border-emerald-300/70 light:bg-emerald-100 light:text-emerald-900",
  info: "app-badge-info border-cyan-400/30 bg-cyan-500/14 text-cyan-100 light:border-cyan-300/70 light:bg-cyan-100 light:text-cyan-900",
  success:
    "app-badge-success border-emerald-400/35 bg-emerald-500/15 text-emerald-100 light:border-emerald-300/70 light:bg-emerald-100 light:text-emerald-900",
  warning:
    "app-badge-warning border-amber-300/35 bg-amber-500/15 text-amber-100 light:border-amber-300/70 light:bg-amber-100 light:text-amber-900",
  danger:
    "app-badge-danger border-rose-400/35 bg-rose-500/15 text-rose-100 light:border-rose-300/70 light:bg-rose-100 light:text-rose-900",
} as const;

const BADGE_SIZE_CLASSES = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-0.5 text-[11px]",
  lg: "px-3 py-1 text-xs",
} as const;

export type BadgeVariant = keyof typeof BADGE_VARIANT_CLASSES;
export type BadgeSize = keyof typeof BADGE_SIZE_CLASSES;

export const BADGE_VARIANT_OPTIONS = Object.keys(
  BADGE_VARIANT_CLASSES,
) as BadgeVariant[];

export const BADGE_SIZE_OPTIONS = Object.keys(
  BADGE_SIZE_CLASSES,
) as BadgeSize[];

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  size?: BadgeSize;
};

export function Badge({
  variant = "neutral",
  size = "md",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border font-medium",
        BADGE_VARIANT_CLASSES[variant],
        BADGE_SIZE_CLASSES[size],
        className,
      )}
      {...props}
    />
  );
}
