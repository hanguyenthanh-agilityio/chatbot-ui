import type { ReactNode } from "react";

// Components
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";

// Constants
import { SIDEBAR_COPY } from "@/constants/app";
import { THEME_SHELL_CLASSES, THEME_SHELL_UTILITIES } from "@/constants/theme";
import {
  THREAD_TIMESTAMP_FORMAT,
  THREAD_TIMESTAMP_LOCALE,
} from "@/constants/date-time";
import { PROVIDER_BADGE_VARIANT } from "@/constants/provider";

// Utils
import { cn } from "@/utils/class-name";

// Types
import type { ChatThread } from "@/types/thread";

function formatTimestamp(value: string) {
  if (!value) {
    return "";
  }

  try {
    return new Intl.DateTimeFormat(
      THREAD_TIMESTAMP_LOCALE,
      THREAD_TIMESTAMP_FORMAT,
    ).format(new Date(value));
  } catch {
    return value;
  }
}

type ThreadSidebarProps = {
  activeThread: ChatThread;
  allThreads: ChatThread[];
  disabled?: boolean;
  accountPanel: ReactNode;
  providerPanel: ReactNode;
  headerActions?: ReactNode;
  variant?: "full" | "nav";
  onSwitchThread: (id: string) => void;
  onCreateThread: () => void;
  onDeleteThread: (id: string) => void;
};

export function ThreadSidebar({
  activeThread,
  allThreads,
  disabled = false,
  accountPanel,
  providerPanel,
  headerActions,
  variant = "full",
  onSwitchThread,
  onCreateThread,
  onDeleteThread,
}: ThreadSidebarProps) {
  const showHeader = variant === "full";
  const showSettingsBlocks = variant === "full";

  return (
    <aside
      className={cn(
        THEME_SHELL_CLASSES.sidebar,
        "flex w-full flex-col rounded-shell border backdrop-blur-shell shadow-shell lg:h-full lg:min-h-0 lg:overflow-hidden lg:max-w-sm",
        "bg-glass-panel",
        THEME_SHELL_UTILITIES.border,
        THEME_SHELL_UTILITIES.text,
      )}
    >
      {showHeader ? (
        <div
          className={cn(
            "border-b px-5 pb-4 pt-5",
            THEME_SHELL_UTILITIES.borderSubtle,
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-1">
              <Text as="p" variant="eyebrow">
                {SIDEBAR_COPY.eyebrow}
              </Text>
              <Text as="h1" variant="title">
                {SIDEBAR_COPY.title}
              </Text>
              <Text variant="captionStrong" className="max-w-xs">
                {SIDEBAR_COPY.description}
              </Text>
            </div>
            {headerActions ? (
              <div className="flex shrink-0 items-center gap-2 -mt-1.5">
                {headerActions}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Settings blocks (only visible on narrower layouts; hidden on xl via caller). */}
      {showSettingsBlocks && accountPanel ? (
        <div className={cn("border-b p-5", THEME_SHELL_UTILITIES.borderSubtle)}>
          {accountPanel}
        </div>
      ) : null}
      {showSettingsBlocks && providerPanel ? (
        <div className={cn("border-b p-5", THEME_SHELL_UTILITIES.borderSubtle)}>
          {providerPanel}
        </div>
      ) : null}

      {/* Threads */}
      <div className="min-h-0 flex-1 overflow-y-auto px-1 py-4">
        <div className="space-y-4">
          <div>
            <div className="mb-2 px-1">
              <Text as="p" variant="eyebrowMuted">
                {SIDEBAR_COPY.currentChatLabel}
              </Text>
            </div>
            <ThreadCard
              thread={activeThread}
              isActive
              disabled={disabled}
              onSelect={() => {}}
              onDelete={() => onDeleteThread(activeThread.id)}
            />
          </div>

          {allThreads.length > 1 && (
            <div>
              <div className="mb-2 px-1">
                <Text as="p" variant="eyebrowMuted">
                  {SIDEBAR_COPY.recentChatsLabel}
                </Text>
              </div>
              <div className="space-y-2">
                {allThreads
                  .filter((t) => t.id !== activeThread.id)
                  .map((thread) => (
                    <ThreadCard
                      key={thread.id}
                      thread={thread}
                      disabled={disabled}
                      onSelect={() => onSwitchThread(thread.id)}
                      onDelete={() => onDeleteThread(thread.id)}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer primary action */}
      <div className={cn("border-t p-3", THEME_SHELL_UTILITIES.borderSubtle)}>
        <Button
          variant="primary"
          size="sm"
          className="w-full justify-center gap-2"
          onClick={onCreateThread}
          disabled={disabled || activeThread.messages.length === 0}
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-3.5 w-3.5"
          >
            <path d="M8 3v10M3 8h10" />
          </svg>
          {SIDEBAR_COPY.newChatLabel}
        </Button>
      </div>
    </aside>
  );
}

function ThreadCard({
  thread,
  isActive = false,
  disabled = false,
  onSelect,
  onDelete,
}: {
  thread: ChatThread;
  isActive?: boolean;
  disabled?: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <Card
      variant={isActive ? "soft" : "panel"}
      className={cn(
        "group cursor-pointer transition-[box-shadow,transform] duration-200",
        "border-white/10 light:border-app-border",
        "hover:border-white/16 light:hover:border-app-border",
        "hover:bg-white/9 light:hover:bg-app-hover",
        isActive
          ? "bg-white/10 shadow-thread-active light:bg-app-surface-raised"
          : "bg-white/4 light:bg-app-surface-subtle",
      )}
      onClick={onSelect}
    >
      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Text as="p" variant="bodyStrong" className="truncate">
              {thread.title}
            </Text>
            <Text variant="caption" className="mt-1 line-clamp-1">
              {thread.preview}
            </Text>
          </div>
          <Badge
            variant={PROVIDER_BADGE_VARIANT[thread.provider]}
            size="sm"
            className="max-w-24 shrink-0 uppercase tracking-wide"
          >
            {thread.provider}
          </Badge>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <Text variant="helper" suppressHydrationWarning>
            {formatTimestamp(thread.updatedAt)}
          </Text>
          <button
            type="button"
            className={cn(
              "cursor-pointer text-compact-10 uppercase tracking-wider hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-50",
              "text-white/30 light:text-app-fg-faint",
            )}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            disabled={disabled}
          >
            {SIDEBAR_COPY.deleteChatLabel}
          </button>
        </div>
      </div>
    </Card>
  );
}
