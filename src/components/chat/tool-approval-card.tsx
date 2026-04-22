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
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
      <Text as="p" className="text-sm font-semibold text-amber-900">
        {title}
      </Text>
      <Text variant="caption" className="mt-1 block text-amber-800">
        {description}
      </Text>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="primary" onClick={onConfirm}>
          {confirmLabel}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>
          {cancelLabel}
        </Button>
      </div>
    </div>
  );
}
