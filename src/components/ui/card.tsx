import type { HTMLAttributes } from "react";
import { cn } from "@/utils/class-name";

const CARD_VARIANT_CLASSES = {
  glass:
    "border border-white/10 bg-glass shadow-glass backdrop-blur-md light:border-app-border light:bg-[image:var(--bg-glass-panel)] light:shadow-glass",
  panel:
    "border border-white/8 bg-white/4 backdrop-blur-[20px] light:border-app-border-subtle light:bg-app-surface-subtle light:shadow-card-surface",
  soft: "border border-white/8 bg-white/6 light:border-app-border-subtle light:bg-app-surface-muted light:shadow-card-surface-soft",
  success:
    "border border-emerald-400/28 bg-emerald-500/10 light:border-app-success-border light:bg-app-success-bg light:text-app-success-fg",
  danger:
    "border border-rose-400/28 bg-rose-500/10 light:border-app-danger-border light:bg-app-danger-bg light:text-app-danger-fg",
} as const;

type CardVariant = keyof typeof CARD_VARIANT_CLASSES;

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
};

export function Card({ variant = "glass", className, ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-2xl", CARD_VARIANT_CLASSES[variant], className)}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "border-b border-white/8 px-4 py-3 light:border-app-border-subtle",
        className,
      )}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-4 py-3", className)} {...props} />;
}
