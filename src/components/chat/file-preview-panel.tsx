"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CloseIcon } from "@/components/ui/icons";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { FileKindIcon } from "@/components/chat/file-attachment-parts";
import { FILE_KIND_LABEL, FILE_PREVIEW_COPY } from "@/constants/file-attachment";
import { THEME_SHELL_UTILITIES } from "@/constants/theme";
import { FILE_PREVIEW_KIND, type ComposerAttachment } from "@/types/file-attachment";
import { formatFileSize } from "@/utils/file-attachment";
import { cn } from "@/utils/class-name";

export function FilePreviewPanel({
  file,
  onClose,
}: {
  file: ComposerAttachment;
  onClose: () => void;
}) {
  const meta = file.sizeBytes != null ? formatFileSize(file.sizeBytes) : null;
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file.kind !== FILE_PREVIEW_KIND.IMAGE || !file.rawFile) {
      setObjectUrl(null);
      return;
    }

    const url = URL.createObjectURL(file.rawFile);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file.kind, file.rawFile]);

  return (
    <aside
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-shell border shadow-shell",
        "bg-glass-panel backdrop-blur-shell",
        THEME_SHELL_UTILITIES.border,
        // Keep padding controlled inside (header/content).
        "text-white light:text-app-fg",
      )}
      aria-label="File preview"
    >
      <div
        className={cn(
          "flex items-start justify-between gap-3 border-b px-5 py-4",
          "bg-glass-header",
          THEME_SHELL_UTILITIES.borderSubtle,
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="shrink-0">
            <FileKindIcon kind={file.kind} size="sm" />
          </div>
          <div className="min-w-0">
            <Text as="p" variant="eyebrow">
              File preview
            </Text>
            <Text as="p" variant="sectionTitle" className="mt-1 line-clamp-2">
              {file.name}
            </Text>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge variant="warning" size="md">
                {FILE_KIND_LABEL[file.kind]}
              </Badge>
              {meta ? (
                <Badge variant="subtle" size="md">
                  {meta}
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
        <Button
          type="button"
          variant="composerAttachChipRemove"
          onClick={onClose}
          aria-label={FILE_PREVIEW_COPY.removeAttachmentLabel(file.name)}
          title={FILE_PREVIEW_COPY.removeAttachmentLabel(file.name)}
          className="mt-0.5"
        >
          <CloseIcon className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3 sm:px-3 sm:py-4">
        {/* Preview area: full-width within column 3 */}
        {file.kind === FILE_PREVIEW_KIND.IMAGE ? (
          objectUrl ? (
            <div
              className={cn(
                "rounded-2xl border p-1 sm:p-1.5",
                "bg-white/2 light:bg-app-surface-subtle",
                THEME_SHELL_UTILITIES.borderSubtle,
              )}
            >
              <img
                src={objectUrl}
                alt={file.name}
                className={cn(
                  "w-full rounded-xl object-contain",
                  // Fill the column and reduce empty space below.
                  "max-h-[calc(100dvh-16rem)]",
                )}
              />
            </div>
          ) : (
            <Text variant="captionMuted" className="px-0.5">
              Image preview is not available.
            </Text>
          )
        ) : (
          <Text variant="captionMuted" className="px-0.5">
            Preview panel layout is ready. File rendering will be added next.
          </Text>
        )}
      </div>
    </aside>
  );
}

