import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import type { ToastNotification } from "@/hooks/use-toast";
import { cn } from "@/utils/class-name";

const TOAST_VARIANT_STYLES = {
  info: "border-slate-200 bg-white text-slate-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-red-200 bg-red-50 text-red-900",
} as const;

type ToastViewportProps = {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastNotification;
  onDismiss: (id: string) => void;
}) {
  return (
    <article
      role="status"
      aria-live="polite"
      className={cn(
        "w-full rounded-xl border p-3 shadow-sm",
        TOAST_VARIANT_STYLES[toast.variant],
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <Text variant="body" className="font-semibold">
            {toast.title}
          </Text>
          {toast.description ? (
            <Text variant="caption" className="text-current opacity-90">
              {toast.description}
            </Text>
          ) : null}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-current hover:bg-black/5"
          onClick={() => onDismiss(toast.id)}
          aria-label="Dismiss notification"
        >
          x
        </Button>
      </div>
    </article>
  );
}

export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  if (toasts.length === 0) return null;

  return (
    <section className="pointer-events-none fixed right-4 top-4 z-50 w-full max-w-sm">
      <div className="pointer-events-auto flex flex-col gap-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </div>
    </section>
  );
}
