"use client";

import { Button } from "@/components/ui/button";
import { CloseIcon } from "@/components/ui/icons";
import { FileKindIcon } from "./file-kind-icon";
import {
  COMPOSER_ATTACH_ICON_XS_CLASS,
  FILE_KIND_LABEL,
  FILE_PREVIEW_COPY,
} from "@/constants/file-attachment";
import type { ComposerAttachment } from "@/types/file-attachment";
import { cn } from "@/utils/class-name";

const chipClass = cn(
  "flex min-w-0 items-center gap-2 rounded-xl border px-2 py-1.5",
  "border-white/12 bg-white/6 light:border-app-border light:bg-app-surface-subtle",
);

export function ComposerAttachmentChip({
  file,
  onRemove,
  onOpenPreview,
}: {
  file: ComposerAttachment;
  onRemove: () => void;
  onOpenPreview?: () => void;
}) {
  return (
    <div className={chipClass}>
      <Button
        type="button"
        variant="composerAttachMenuItem"
        onClick={onOpenPreview}
        disabled={!onOpenPreview}
        aria-label={FILE_PREVIEW_COPY.openAttachmentPreviewLabel(file.name)}
        className="min-w-0 flex-1 gap-2 rounded-lg px-0 py-0"
      >
        <FileKindIcon kind={file.kind} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-snug text-white/95 light:text-app-fg">
            {file.name}
          </p>
          <p className="text-xs uppercase tracking-wide text-white/45 light:text-app-fg-faint">
            {FILE_KIND_LABEL[file.kind]}
          </p>
        </div>
      </Button>
      <Button
        type="button"
        variant="composerAttachChipRemove"
        onClick={onRemove}
        aria-label={FILE_PREVIEW_COPY.removeAttachmentLabel(file.name)}
      >
        <CloseIcon className={COMPOSER_ATTACH_ICON_XS_CLASS} />
      </Button>
    </div>
  );
}
