import { Avatar } from "@/components/ui/avatar";
import { Text } from "@/components/ui/text";
import { CHAT_EMPTY_STATE_COPY } from "@/constants/chat";
import { THEME_SHELL_UTILITIES } from "@/constants/theme";
import { cn } from "@/utils/class-name";

export function ChatEmptyState() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-12">
      <div
        className={cn(
          "flex w-full max-w-chat-empty flex-col items-center gap-6 rounded-3xl border border-white/10 p-8 shadow-glass-hero backdrop-blur-[2rem]",
          "bg-glass light:border-app-border light:bg-app-surface-muted light:shadow-panel light:backdrop-blur-none",
          THEME_SHELL_UTILITIES.border,
        )}
      >
        <div className="flex items-center justify-center">
          <Avatar variant="assistant" size="lg" />
        </div>

        <div className="text-center">
          <Text
            as="h2"
            variant="title"
            className="mb-2 text-[1.875rem] leading-[1.3]"
          >
            {CHAT_EMPTY_STATE_COPY.title}
          </Text>
          <Text variant="subtitle" className="text-sm leading-relaxed">
            {CHAT_EMPTY_STATE_COPY.description}
          </Text>
        </div>
      </div>
    </div>
  );
}
