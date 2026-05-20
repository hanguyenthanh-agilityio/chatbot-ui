import { Avatar } from "@/components/ui/avatar";
import { Text } from "@/components/ui/text";
import { CHAT_EMPTY_STATE_COPY } from "@/constants/chat";
import { cn } from "@/utils/class-name";
import type { QuickAction } from "@/types/chat";

type ChatEmptyStateProps = {
  quickActions: QuickAction[];
  onSelectPrompt: (prompt: string) => void;
};

export function ChatEmptyState({
  quickActions,
  onSelectPrompt,
}: ChatEmptyStateProps) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-12">
      <div
        className={cn(
          "flex w-full max-w-chat-empty flex-col items-center gap-6 rounded-3xl border border-white/10 p-8 shadow-glass-hero backdrop-blur-[2rem]",
          "bg-glass",
        )}
      >
        <div className="flex items-center justify-center">
          <Avatar variant="assistant" size="lg" />
        </div>

        <div className="text-center">
          <Text
            as="h2"
            variant="inherit"
            className="mb-2 text-[1.875rem] font-bold leading-[1.3] text-white"
          >
            {CHAT_EMPTY_STATE_COPY.title}
          </Text>
          <Text variant="subtitle" className="text-sm leading-relaxed text-white/72">
            {CHAT_EMPTY_STATE_COPY.description}
          </Text>
        </div>

        <div className="flex flex-wrap justify-center gap-2.5">
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              className="cursor-pointer rounded-full border border-white/18 bg-white/6 px-3.5 py-1.5 text-xs text-white/78 backdrop-blur-[0.625rem] transition-all duration-200 hover:border-violet-300/55 hover:bg-violet-600/20 hover:text-white hover:shadow-chip-brand"
              onClick={() => onSelectPrompt(action.prompt)}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
