import { Button } from "@/components/ui/button";
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
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-lg font-semibold text-white shadow-lg shadow-slate-900/10">
        {CHAT_EMPTY_STATE_COPY.badge}
      </div>
      <Text as="h2" className="text-3xl font-semibold text-slate-900">
        {CHAT_EMPTY_STATE_COPY.title}
      </Text>
      <Text variant="subtitle" className="mt-3 max-w-2xl text-base text-slate-600">
        {CHAT_EMPTY_STATE_COPY.description}
      </Text>

      <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
        {quickActions.map((action) => (
          <Button
            key={action.label}
            type="button"
            variant="outline"
            size="lg"
            className="justify-start rounded-2xl border-slate-200 bg-white/85 px-4 text-left shadow-sm hover:border-slate-300 hover:bg-white"
            onClick={() => onSelectPrompt(action.prompt)}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
