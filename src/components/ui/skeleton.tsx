import type { HTMLAttributes } from "react";
import { cn } from "@/utils/class-name";

export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("app-skeleton-bar rounded-md", className)}
      {...props}
    />
  );
}
