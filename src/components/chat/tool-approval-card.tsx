import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

type ToolApprovalCardProps = {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ToolApprovalCard({
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ToolApprovalCardProps) {
  return (
    <div className="rounded-tl rounded-tr-2xl rounded-br-2xl rounded-bl-2xl border border-white/10 bg-white/[.08] backdrop-blur-md px-4 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.2)]">
      <Text as="p" variant="sectionTitle">
        {title}
      </Text>
      <Text variant="helper" className="mt-1 block">
        {description}
      </Text>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="primary" onClick={onConfirm}>
          {confirmLabel}
        </Button>
        <Button type="button" size="sm" variant="ghost" className="border border-white/[.12] font-dm-sans text-white/60 hover:bg-white/[.08]" onClick={onCancel}>
          {cancelLabel}
        </Button>
      </div>
    </div>
  );
}
