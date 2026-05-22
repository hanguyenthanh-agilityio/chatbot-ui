import type { HTMLAttributes } from "react";
import { cn } from "@/utils/class-name";

export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-white/10 light:bg-app-hover",
        className,
      )}
      {...props}
    />
  );
}

