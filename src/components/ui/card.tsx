import type { HTMLAttributes } from "react";
import { cn } from "@/utils/class-name";

const CARD_VARIANT_CLASSES = {
  glass:
    "border border-white/10 bg-glass shadow-glass backdrop-blur-md light:border-app-border-10 light:bg-[image:var(--bg-glass-panel)] light:shadow-glass",
  panel:
    "border border-white/8 bg-white/4 backdrop-blur-[20px] light:border-app-border-8 light:bg-app-surface-4 light:shadow-card-surface",
  soft:
    "border border-white/8 bg-white/6 light:border-app-border-8 light:bg-app-surface-6 light:shadow-card-surface-soft",
  success: "border border-emerald-400/28 bg-emerald-500/10",
  danger: "border border-rose-400/28 bg-rose-500/10",
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
        "border-b border-white/8 px-4 py-3 light:border-app-border-8",
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