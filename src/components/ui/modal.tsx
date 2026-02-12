"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

type ModalProps = {
  open: boolean;
  title: string;
  description?: string;
  closeLabel?: string;
  onClose: () => void;
};

export function Modal({
  open,
  title,
  description,
  closeLabel = "OK",
  onClose,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <section
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <article
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="space-y-2">
          <Text as="h2" variant="title" className="text-lg">
            {title}
          </Text>
          {description ? <Text variant="body">{description}</Text> : null}
        </div>

        <div className="mt-5 flex justify-end">
          <Button type="button" variant="primary" size="md" onClick={onClose}>
            {closeLabel}
          </Button>
        </div>
      </article>
    </section>
  );
}
