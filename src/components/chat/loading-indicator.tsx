import { APP_NAME } from "@/constants/app";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/class-name";

const SKELETON_WIDTHS = ["w-full", "w-4/5", "w-3/5"] as const;
const DOT_DELAYS = ["0ms", "150ms", "300ms"] as const;

export type LoadingIndicatorProps = {
  showAvatar?: boolean;
  label?: string;
  className?: string;
};

export function LoadingIndicator({
  showAvatar = true,
  label,
  className,
}: LoadingIndicatorProps) {
  const headerLabel = label?.trim() || "Thinking";

  return (
    <article
      className={cn(
        "flex items-start gap-2.5 py-1",
        !showAvatar && "gap-0 py-0",
        className,
      )}
    >
      {showAvatar ? (
        <Avatar variant="assistant" size="sm" className="mt-0.5" />
      ) : null}

      <Card
        variant="glass"
        className={cn(
          "w-loading-card max-w-full px-4 py-3.5 shadow-glass-elevated bg-glass-loading",
          "light:shadow-panel-sm light:backdrop-blur-none",
        )}
      >
        <div className="mb-2.5">
          <span className="font-primary text-sm font-semibold tracking-wide text-white/82 light:text-app-fg-muted">
            {APP_NAME}
          </span>
        </div>

        <div className="mb-3 flex items-center gap-1">
          <span className="text-sm font-medium text-white/68 light:text-app-fg-muted">
            {headerLabel}
          </span>
          <span className="ml-0.5 flex gap-0.5" aria-hidden="true">
            {DOT_DELAYS.map((delay, i) => (
              <span
                key={i}
                className="app-skeleton-dot h-1.5 w-1.5 rounded-full animate-pulse"
                style={{ animationDelay: delay, animationDuration: "1200ms" }}
              />
            ))}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {SKELETON_WIDTHS.map((width, i) => (
            <Skeleton key={i} className={cn("h-3.5 rounded-full", width)} />
          ))}
        </div>
      </Card>
    </article>
  );
}
