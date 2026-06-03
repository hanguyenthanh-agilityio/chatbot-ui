"use client";

import Image from "next/image";
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

const PREVIEW_FRAME_CLASS = cn(
  "rounded-2xl border p-1 sm:p-1.5",
  "bg-white/2 light:bg-app-surface-subtle",
  THEME_SHELL_UTILITIES.borderSubtle,
);

const IMAGE_FALLBACK_CLASS = cn(
  PREVIEW_FRAME_CLASS,
  "flex min-h-preview flex-col items-center justify-center gap-3 px-6 py-10 text-center",
);

type ImagePreviewState = {
  file: File;
  url: string;
};

export function FilePreviewPanel({
  file,
  onClose,
}: {
  file: ComposerAttachment;
  onClose: () => void;
}) {
  const meta = file.sizeBytes != null ? formatFileSize(file.sizeBytes) : null;
  const imageFile =
    file.kind === FILE_PREVIEW_KIND.IMAGE ? file.rawFile : undefined;
  const [preview, setPreview] = useState<ImagePreviewState | null>(null);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  useEffect(() => {
    if (!imageFile) return;

    let cancelled = false;
    const reader = new FileReader();

    reader.onload = () => {
      if (cancelled || typeof reader.result !== "string") return;

      setPreview({ file: imageFile, url: reader.result });
      setImageLoadFailed(false);
    };

    reader.onerror = () => {
      if (!cancelled) setImageLoadFailed(true);
    };

    reader.readAsDataURL(imageFile);

    return () => {
      cancelled = true;
    };
  }, [imageFile]);

  const objectUrl =
    imageFile && preview?.file === imageFile ? preview.url : null;
  const showImage = objectUrl != null && !imageLoadFailed;

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
          aria-label={FILE_PREVIEW_COPY.closePreviewLabel}
          title={FILE_PREVIEW_COPY.closePreviewLabel}
          className="mt-0.5"
        >
          <CloseIcon className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3 sm:px-3 sm:py-4">
        {file.kind === FILE_PREVIEW_KIND.IMAGE ? (
          showImage && objectUrl ? (
            <div className={PREVIEW_FRAME_CLASS}>
              <Image
                src={objectUrl}
                alt={file.name}
                width={1600}
                height={1200}
                unoptimized
                sizes="100vw"
                onError={() => setImageLoadFailed(true)}
                className="h-auto w-full max-h-file-preview-image rounded-xl object-contain"
              />
            </div>
          ) : (
            <div className={IMAGE_FALLBACK_CLASS}>
              <FileKindIcon kind={FILE_PREVIEW_KIND.IMAGE} />
              <Text variant="captionMuted">
                {FILE_PREVIEW_COPY.imagePreviewUnavailable}
              </Text>
            </div>
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
