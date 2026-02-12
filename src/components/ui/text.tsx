import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/utils/class-name";

const TEXT_VARIANT_CLASSES = {
  display: "text-3xl font-semibold tracking-tight text-slate-900",
  title: "text-2xl font-semibold text-slate-900",
  subtitle: "text-sm text-slate-600",
  body: "text-sm text-slate-900",
  inherit: "text-sm text-inherit",
  muted: "text-sm text-slate-500",
  caption: "text-xs text-slate-600",
  error: "text-sm text-red-700",
  warning: "text-xs text-amber-700",
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
