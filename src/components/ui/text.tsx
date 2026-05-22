import type { ElementType } from "react";
import { TEXT_VARIANT_CLASSES } from "@/constants/text";
import type { TextProps } from "@/types/text";
import { cn } from "@/utils/class-name";

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
