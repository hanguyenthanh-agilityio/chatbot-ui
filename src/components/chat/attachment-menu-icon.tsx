import type { ReactNode } from "react";
import { cn } from "@/utils/class-name";

const iconBoxClass = cn(
  "grid h-9 w-9 shrink-0 place-items-center rounded-lg border",
  "border-white/10 bg-white/6 text-white/75",
  "light:border-app-border-subtle light:bg-app-surface-subtle light:text-app-fg-muted",
);

export function AttachmentMenuIcon({ children }: { children: ReactNode }) {
  return (
    <span className={iconBoxClass} aria-hidden>
      {children}
    </span>
  );
}
