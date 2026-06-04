"use client";

import { FileKindIcon } from "@/components/chat/file-kind-icon";
import { Text } from "@/components/ui/text";
import {
  FILE_PREVIEW_COPY,
  FILE_PREVIEW_DOCX_CONTENT_CLASS,
  FILE_PREVIEW_FALLBACK_CLASS,
} from "@/constants/file-attachment";
import { useDocxPreview } from "@/hooks/use-docx-preview";
import { FILE_PREVIEW_KIND } from "@/types/file-attachment";

export function FilePreviewDocx({ file }: { file: File | undefined }) {
  const { bodyRef, styleRef, isLoading, hasFailed } = useDocxPreview(file);

  if (!file) {
    return (
      <div className={FILE_PREVIEW_FALLBACK_CLASS}>
        <FileKindIcon kind={FILE_PREVIEW_KIND.DOCX} />
        <Text variant="captionMuted">
          {FILE_PREVIEW_COPY.docxPreviewUnavailable}
        </Text>
      </div>
    );
  }

  if (hasFailed) {
    return (
      <div className={FILE_PREVIEW_FALLBACK_CLASS}>
        <FileKindIcon kind={FILE_PREVIEW_KIND.DOCX} />
        <Text variant="captionMuted">
          {FILE_PREVIEW_COPY.docxPreviewUnavailable}
        </Text>
      </div>
    );
  }

  return (
    <div className={FILE_PREVIEW_DOCX_CONTENT_CLASS}>
      {isLoading ? (
        <div className={FILE_PREVIEW_FALLBACK_CLASS}>
          <Text variant="captionMuted">{FILE_PREVIEW_COPY.docxPreviewLoading}</Text>
        </div>
      ) : null}
      <div ref={styleRef} className="docx-preview-styles" aria-hidden />
      <div
        ref={bodyRef}
        className="docx-preview-body min-h-0 w-full min-w-0 max-w-full overflow-x-hidden"
      />
    </div>
  );
}
