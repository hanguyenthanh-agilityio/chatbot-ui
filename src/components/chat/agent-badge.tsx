type AgentBadgeProps = {
  label: string;
};

export function AgentBadge({ label }: AgentBadgeProps) {
  return (
    <span className="font-dm-sans inline-flex rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-[11px] font-medium text-violet-300">
      {label}
    </span>
  );
}
