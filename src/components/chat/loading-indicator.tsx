type LoadingIndicatorProps = {
  badge: string;
};

export function LoadingIndicator({ badge }: LoadingIndicatorProps) {
  return (
    <article className="flex gap-3">
      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
        {badge}
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400 [animation-delay:120ms]" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400 [animation-delay:240ms]" />
        </div>
      </div>
    </article>
  );
}
