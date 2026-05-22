import type { SVGProps } from "react";

// Utils
import { cn } from "@/utils/class-name";

// Types
type IconProps = SVGProps<SVGSVGElement>;

const STROKE_ICON_PROPS = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function SunIcon({ className, strokeWidth = 2.25, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(className)}
      aria-hidden
      {...STROKE_ICON_PROPS}
      strokeWidth={strokeWidth}
      {...props}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

export function MoonIcon({ className, strokeWidth = 2.25, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(className)}
      aria-hidden
      {...STROKE_ICON_PROPS}
      strokeWidth={strokeWidth}
      {...props}
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}
