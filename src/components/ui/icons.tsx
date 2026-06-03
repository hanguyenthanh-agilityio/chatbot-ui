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

export function RefreshIcon({ className, strokeWidth = 2, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(className)}
      aria-hidden
      {...STROKE_ICON_PROPS}
      strokeWidth={strokeWidth}
      {...props}
    >
      <path d="M21 12a9 9 0 0 0-15.5-6.36L3 8" />
      <path d="M3 4v4h4" />
      <path d="M3 12a9 9 0 0 0 15.5 6.36L21 16" />
      <path d="M21 20v-4h-4" />
    </svg>
  );
}

export function UploadIcon({ className, strokeWidth = 1.75, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(className)}
      aria-hidden
      {...STROKE_ICON_PROPS}
      strokeWidth={strokeWidth}
      {...props}
    >
      <path d="M12 3v10M8.5 9.5 12 6l3.5 3.5" />
      <path d="M5 14.5v3.5a2 2 0 002 2h10a2 2 0 002-2v-3.5" />
    </svg>
  );
}

export function ClockIcon({ className, strokeWidth = 1.75, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(className)}
      aria-hidden
      {...STROKE_ICON_PROPS}
      strokeWidth={strokeWidth}
      {...props}
    >
      <circle cx="12" cy="12" r="8.25" />
      <path d="M12 8v4.25l2.75 1.5" />
    </svg>
  );
}

export function ChevronRightIcon({ className, strokeWidth = 1.5, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={cn(className)}
      aria-hidden
      {...STROKE_ICON_PROPS}
      strokeWidth={strokeWidth}
      {...props}
    >
      <path d="M6 4l4 4-4 4" />
    </svg>
  );
}

export function PlusIcon({ className, strokeWidth = 2, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(className)}
      aria-hidden
      {...STROKE_ICON_PROPS}
      strokeWidth={strokeWidth}
      {...props}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function CloseIcon({ className, strokeWidth = 1.75, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={cn(className)}
      aria-hidden
      {...STROKE_ICON_PROPS}
      strokeWidth={strokeWidth}
      {...props}
    >
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

export function SendIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(className)}
      aria-hidden
      fill="currentColor"
      {...props}
    >
      <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
    </svg>
  );
}

export function FileDocumentIcon({ className, strokeWidth = 1.5, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(className)}
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
      {...props}
    >
      <path d="M7 4.5h6.8L16.5 8.2V19a1.25 1.25 0 01-1.25 1.25H7.25A1.25 1.25 0 016 19V5.75A1.25 1.25 0 017.25 4.5H7z" />
      <path d="M14 4.5V8.2h3.5" strokeLinecap="round" />
    </svg>
  );
}

export function FileVideoIcon({ className, strokeWidth = 1.5, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(className)}
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      {...props}
    >
      <rect x="5" y="7" width="14" height="10" rx="2" />
      <path d="M11 10.5v5l4.5-2.5L11 10.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FileAudioIcon({ className, strokeWidth = 1.5, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(className)}
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      {...props}
    >
      <path d="M9.5 8.5v8a2 2 0 11-4 0v-8" />
      <path d="M9.5 8.5c0-2.5 2.5-4 5.5-2.5 1.5.8 2.5 2.4 2.5 4.2v5.3a2 2 0 11-4 0" />
    </svg>
  );
}
