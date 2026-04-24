import { AssistantAvatar } from "@/components/ui/avatar";
import { Text } from "@/components/ui/text";
import { CHAT_EMPTY_STATE_COPY } from "@/constants/chat";
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
      {/* Glass welcome card matching reference WelcomeScreen */}
      <div className="w-full max-w-[520px] rounded-[24px] p-8 flex flex-col items-center gap-6 backdrop-blur-[32px] border bg-white/[.05] border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.1)]">
        {/* Logo / badge */}
        <div className="flex items-center justify-center">
          <AssistantAvatar size="lg" />
        </div>

        {/* Title + subtitle */}
        <div className="text-center">
          <Text
            as="h2"
            variant="inherit"
            className="mb-2 font-dm-sans text-[28px] font-bold leading-[1.35] text-white"
          >
            {CHAT_EMPTY_STATE_COPY.title}
          </Text>
          <Text variant="subtitle" className="text-sm leading-relaxed">
            {CHAT_EMPTY_STATE_COPY.description}
          </Text>
        </div>

        {/* Suggestion chips — rounded-full pill style */}
        <div className="flex flex-wrap gap-2 justify-center">
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              className="rounded-full text-xs px-3.5 py-1.5 cursor-pointer border transition-all duration-200 backdrop-blur-[10px] font-dm-sans bg-white/[.06] border-white/[.18] text-white/75 hover:bg-violet-600/20 hover:border-violet-500/50 hover:text-white hover:shadow-[0_4px_12px_rgba(99,60,220,0.2)]"
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
