"use client";

import Image from "next/image";
import { useEffect, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Button } from "@/components/ui/button";
import { CloseIcon } from "@/components/ui/icons";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { FileKindIcon } from "@/components/chat/file-kind-icon";
import {
  FILE_KIND_LABEL,
  FILE_PREVIEW_COPY,
  FILE_PREVIEW_FALLBACK_CLASS,
  FILE_PREVIEW_FRAME_CLASS,
  FILE_PREVIEW_PANEL_CLASS,
  FILE_PREVIEW_PANEL_WIDTH,
  FILE_PREVIEW_RESIZE_GRIP_CLASS,
  FILE_PREVIEW_RESIZE_GRIP_DOT_CLASS,
  FILE_PREVIEW_RESIZE_HANDLE_CLASS,
} from "@/constants/file-attachment";
import { THEME_SHELL_UTILITIES } from "@/constants/theme";
import { FILE_PREVIEW_KIND, type ComposerAttachment } from "@/types/file-attachment";
import { bindFilePreviewPanelResize, formatFileSize } from "@/utils/file-attachment";
import { cn } from "@/utils/class-name";

type ImagePreviewState = {
  file: File;
  url: string;
};

/** Column-3 preview panel: image preview, fallback UI, and desktop resize handle. */
export function FilePreviewPanel({
  file,
  width,
  onWidthChange,
  onClose,
}: {
  file: ComposerAttachment;
  width: number | null;
  onWidthChange: (width: number) => void;
  onClose: () => void;
}) {
  const meta = file.sizeBytes != null ? formatFileSize(file.sizeBytes) : null;
  const imageFile =
    file.kind === FILE_PREVIEW_KIND.IMAGE ? file.rawFile : undefined;
  const [preview, setPreview] = useState<ImagePreviewState | null>(null);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  // Data URL avoids blob revoke issues in Strict Mode; setState runs in reader callbacks only.
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

  // width null in parent → measure current column; custom resize sets px on grid.
  const startResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const container = event.currentTarget.parentElement;
    bindFilePreviewPanelResize({
      startX: event.clientX,
      startWidth:
        width ??
        container?.getBoundingClientRect().width ??
        FILE_PREVIEW_PANEL_WIDTH.default,
      onWidthChange,
      onActiveChange: setIsResizing,
    });
  };

  return (
    <div className="relative min-h-0 min-w-0 w-full lg:h-full">
      {/* Handle is a sibling of the panel (not inside aside) so it sits on the column seam. */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label={FILE_PREVIEW_COPY.resizePreviewLabel}
        aria-valuemin={FILE_PREVIEW_PANEL_WIDTH.min}
        aria-valuemax={FILE_PREVIEW_PANEL_WIDTH.max}
        aria-valuenow={width ?? undefined}
        data-resizing={isResizing}
        onPointerDown={startResize}
        className={FILE_PREVIEW_RESIZE_HANDLE_CLASS}
      >
        <span aria-hidden className={FILE_PREVIEW_RESIZE_GRIP_CLASS}>
          {[0, 1, 2].map((dot) => (
            <span key={dot} className={FILE_PREVIEW_RESIZE_GRIP_DOT_CLASS} />
          ))}
        </span>
      </div>

      <aside className={FILE_PREVIEW_PANEL_CLASS} aria-label="File preview">
        <div
          className={cn(
            "flex items-start justify-between gap-3 border-b px-5 py-4",
            "bg-glass-header",
            THEME_SHELL_UTILITIES.borderSubtle,
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            <FileKindIcon kind={file.kind} size="sm" />
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
              <div className={FILE_PREVIEW_FRAME_CLASS}>
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
              <div className={FILE_PREVIEW_FALLBACK_CLASS}>
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
    </div>
  );
}
