type AgentBadgeProps = {
  label: string;
};

export function AgentBadge({ label }: AgentBadgeProps) {
  return (
    <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-700">
      {label}
    </span>
  );
}
