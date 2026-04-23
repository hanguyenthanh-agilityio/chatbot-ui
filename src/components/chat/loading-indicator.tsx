import { APP_NAME } from "@/constants/app";
import { AssistantAvatar } from "@/components/chat/assistant-avatar";

const SKELETON_WIDTHS = ["w-full", "w-4/5", "w-3/5"] as const;
const DOT_DELAYS = ["0ms", "150ms", "300ms"] as const;

export function LoadingIndicator() {
  return (
    <article className="flex items-start gap-2.5 py-1">
      <AssistantAvatar size="sm" className="mt-0.5" />

      {/* Processing card */}
      <div className="w-[280px] px-4 py-3.5 backdrop-blur-md rounded-tl rounded-tr-2xl rounded-br-2xl rounded-bl-2xl bg-white/[.08] border border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.2)]">
        {/* App name */}
        <div className="mb-2.5">
          <span className="font-syne text-[15px] font-semibold tracking-wide text-white/85">
            {APP_NAME}
          </span>
        </div>

        {/* Thinking + bounce dots */}
        <div className="mb-3 flex items-center gap-1">
          <span className="font-dm-sans text-sm font-medium text-white/65">
            Thinking
          </span>
          <span className="ml-0.5 flex gap-0.5">
            {DOT_DELAYS.map((delay, i) => (
              <span
                key={i}
                className="h-1 w-1 rounded-full bg-white/40 animate-bounce"
                style={{ animationDelay: delay }}
              />
            ))}
          </span>
        </div>

        {/* Skeleton lines */}
        <div className="flex flex-col gap-2">
          {SKELETON_WIDTHS.map((width, i) => (
            <div
              key={i}
              className={`h-2.5 rounded-full animate-pulse bg-white/[.08] ${width}`}
            />
          ))}
        </div>
      </div>
    </article>
  );
}
