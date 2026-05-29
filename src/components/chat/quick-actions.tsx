import type { QuickAction } from "@/types/chat";

type ChatQuickActionsProps = {
  quickActions: QuickAction[];
  onSelectPrompt: (prompt: string) => void;
};

export function ChatQuickActions({
  quickActions,
  onSelectPrompt,
}: ChatQuickActionsProps) {
  if (quickActions.length === 0) {
    return null;
  }

  return (
    <div
      className="flex flex-wrap justify-center gap-2 px-1"
      role="group"
      aria-label="Suggested prompts"
    >
      {quickActions.map((action) => (
        <button
          key={action.label}
          type="button"
          className="cursor-pointer rounded-full border border-white/18 bg-white/6 px-3.5 py-1.5 text-xs text-white/78 backdrop-blur-chip transition-all duration-200 hover:border-violet-300/55 hover:bg-violet-600/20 hover:text-white hover:shadow-chip-brand light:border-app-border light:bg-app-surface-subtle light:text-app-fg-muted light:hover:border-amber-800/30 light:hover:bg-amber-950/8 light:hover:text-app-fg light:hover:shadow-card-surface"
          onClick={() => onSelectPrompt(action.prompt)}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
