"use client";

import {
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/button";
import { CloseIcon } from "@/components/ui/icons";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { FileKindIcon } from "@/components/chat/file-kind-icon";
import { FilePreviewCodeFile } from "@/components/chat/file-preview-common";
import { FilePreviewDocx } from "@/components/chat/file-preview-docx";
import { FilePreviewImage } from "@/components/chat/file-preview-image";
import { FilePreviewMp3, FilePreviewMp4 } from "@/components/chat/file-preview-media";
import { FilePreviewPdf } from "@/components/chat/file-preview-pdf";
import {
  FILE_PREVIEW_COPY,
  FILE_PREVIEW_PANEL_CLASS,
  FILE_PREVIEW_PANEL_WIDTH,
  FILE_PREVIEW_RESIZE_GRIP_CLASS,
  FILE_PREVIEW_RESIZE_GRIP_DOT_CLASS,
  FILE_PREVIEW_RESIZE_HANDLE_CLASS,
  FILE_PREVIEW_SCROLL_CLASS,
  isFilePreviewEmbeddedKind,
} from "@/constants/file-attachment";
import { THEME_SHELL_UTILITIES } from "@/constants/theme";
import {
  FILE_PREVIEW_KIND,
  type ComposerAttachment,
  type SupportedFilePreviewKind,
} from "@/types/file-attachment";
import {
  bindFilePreviewPanelResize,
  formatFileSize,
  getFileKindLabel,
} from "@/utils/file-attachment";
import { cn } from "@/utils/class-name";

const FILE_PREVIEW_PANEL_RENDERERS: Record<
  SupportedFilePreviewKind,
  (file: ComposerAttachment) => ReactNode
> = {
  [FILE_PREVIEW_KIND.IMAGE]: (file) => (
    <FilePreviewImage file={file.rawFile} name={file.name} />
  ),
  [FILE_PREVIEW_KIND.DOCX]: (file) => (
    <FilePreviewDocx file={file.rawFile} />
  ),
  [FILE_PREVIEW_KIND.PDF]: (file) => (
    <FilePreviewPdf file={file.rawFile} name={file.name} />
  ),
  [FILE_PREVIEW_KIND.MP4]: (file) => (
    <FilePreviewMp4 file={file.rawFile} name={file.name} />
  ),
  [FILE_PREVIEW_KIND.MP3]: (file) => (
    <FilePreviewMp3 file={file.rawFile} name={file.name} />
  ),
  [FILE_PREVIEW_KIND.CSV]: (file) => (
    <FilePreviewCodeFile file={file.rawFile} kind={FILE_PREVIEW_KIND.CSV} />
  ),
  [FILE_PREVIEW_KIND.JSON]: (file) => (
    <FilePreviewCodeFile file={file.rawFile} kind={FILE_PREVIEW_KIND.JSON} />
  ),
};

function FilePreviewPanelContent({ file }: { file: ComposerAttachment }) {
  const render =
    file.kind !== FILE_PREVIEW_KIND.UNKNOWN
      ? FILE_PREVIEW_PANEL_RENDERERS[file.kind]
      : undefined;

  if (!render) {
    return (
      <Text variant="captionMuted" className="px-0.5">
        {FILE_PREVIEW_COPY.previewUnavailable}
      </Text>
    );
  }

  return render(file);
}

/** Column-3 preview panel: file preview by kind and desktop resize handle. */
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
  const [isResizing, setIsResizing] = useState(false);

  const startResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const container = event.currentTarget.parentElement;
    bindFilePreviewPanelResize({
      handle: event.currentTarget,
      pointerId: event.pointerId,
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
    <div
      className="relative min-h-0 min-w-0 w-full lg:h-full"
      data-resizing={isResizing}
    >
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

      <aside
        className={FILE_PREVIEW_PANEL_CLASS}
        aria-label={FILE_PREVIEW_COPY.panelAriaLabel}
      >
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
                {FILE_PREVIEW_COPY.panelTitle}
              </Text>
              <Text as="p" variant="sectionTitle" className="mt-1 line-clamp-2">
                {file.name}
              </Text>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge variant="warning" size="md">
                  {getFileKindLabel(file.kind)}
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

        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col overflow-hidden py-3",
            isFilePreviewEmbeddedKind(file.kind)
              ? "px-2 sm:px-3"
              : cn(
                  "overflow-y-auto pl-2 pr-0 sm:pl-3",
                  FILE_PREVIEW_SCROLL_CLASS,
                ),
          )}
        >
          <FilePreviewPanelContent file={file} />
        </div>
      </aside>
    </div>
  );
}
