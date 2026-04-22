import type { ReactNode } from "react";
import { Text } from "@/components/ui/text";
import { SIDEBAR_COPY } from "@/constants/app";
import {
  THREAD_TIMESTAMP_FORMAT,
  THREAD_TIMESTAMP_LOCALE,
} from "@/constants/date-time";
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
  thread: ChatThread;
  disabled?: boolean;
  accountPanel: ReactNode;
  providerPanel: ReactNode;
  onDeleteThread: () => void;
};

export function ThreadSidebar({
  thread,
  disabled = false,
  accountPanel,
  providerPanel,
  onDeleteThread,
}: ThreadSidebarProps) {
  return (
    <aside className="flex w-full flex-col rounded-[2rem] border border-slate-800 bg-slate-950 text-white shadow-2xl lg:max-w-sm">
      <div className="border-b border-white/10 p-5">
        <div className="space-y-1">
          <Text as="p" className="text-xs font-medium uppercase tracking-[0.2em] text-sky-300">
            {SIDEBAR_COPY.eyebrow}
          </Text>
          <Text as="h1" className="text-2xl font-semibold text-white">
            {SIDEBAR_COPY.title}
          </Text>
          <Text variant="caption" className="text-slate-400">
            {SIDEBAR_COPY.description}
          </Text>
        </div>
      </div>

      <div className="border-b border-white/10 p-5">{accountPanel}</div>

      <div className="border-b border-white/10 p-5">{providerPanel}</div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="mb-3 px-2">
          <Text as="p" className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
            {SIDEBAR_COPY.currentChatLabel}
          </Text>
        </div>

        <div className="group rounded-2xl border border-sky-400/40 bg-sky-400/10 transition">
          <div className="px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Text as="p" className="truncate text-sm font-medium text-white">
                  {thread.title}
                </Text>
                <Text variant="caption" className="mt-1 line-clamp-2 text-slate-300">
                  {thread.preview}
                </Text>
              </div>
              <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-300">
                {thread.provider}
              </span>
            </div>
            <Text
              variant="caption"
              className="mt-2 block text-slate-400"
              suppressHydrationWarning
            >
              {formatTimestamp(thread.updatedAt)}
            </Text>
          </div>

          <div className="px-4 pb-3">
            <button
              type="button"
              className="text-xs text-slate-400 transition hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={onDeleteThread}
              disabled={disabled}
            >
              {SIDEBAR_COPY.deleteChatLabel}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
