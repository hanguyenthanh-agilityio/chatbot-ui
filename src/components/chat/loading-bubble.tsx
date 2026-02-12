import { Text } from "@/components/ui/text";

export function LoadingBubble() {
  return (
    <article className="mr-auto flex max-w-[90%] items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600">
      <Text variant="muted" as="span">
        Assistant is thinking
      </Text>
      <span className="inline-flex items-center gap-1">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:120ms]" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:240ms]" />
      </span>
    </article>
  );
}
