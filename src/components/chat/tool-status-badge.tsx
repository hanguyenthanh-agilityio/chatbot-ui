type ToolStatusTone = "success" | "error" | "neutral";

type ToolStatusBadgeProps = {
  text: string;
  tone: ToolStatusTone;
};

const toneClasses: Record<ToolStatusTone, string> = {
  error: "border border-red-500/25 bg-red-500/10 text-red-400 font-dm-sans",
  success: "border border-emerald-500/25 bg-emerald-500/10 text-emerald-400 font-dm-sans",
  neutral: "border border-white/10 bg-white/[.06] text-white/50 font-dm-sans",
};

export function ToolStatusBadge({ text, tone }: ToolStatusBadgeProps) {
  return (
    <div className={`rounded-2xl px-4 py-3 text-sm ${toneClasses[tone]}`}>
      {text}
    </div>
  );
}
