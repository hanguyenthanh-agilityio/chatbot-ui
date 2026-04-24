import type { HTMLAttributes } from "react";
import { cn } from "@/utils/class-name";

export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-white/[.1]", className)}
      {...props}
    />
  );
}

