type ToolStatusTone = "success" | "error" | "neutral";

type ToolStatusBadgeProps = {
  text: string;
  tone: ToolStatusTone;
};

const toneClasses: Record<ToolStatusTone, string> = {
  error: "border border-red-200 bg-red-50 text-red-700",
  success: "border border-emerald-200 bg-emerald-50 text-emerald-700",
  neutral: "border border-slate-200 bg-slate-50 text-slate-600",
};

export function ToolStatusBadge({ text, tone }: ToolStatusBadgeProps) {
  return (
    <div className={`rounded-2xl px-4 py-3 text-sm ${toneClasses[tone]}`}>
      {text}
    </div>
  );
}
