"use client";

import { FilePreviewEmbeddedBody } from "@/components/chat/file-preview-common";
import {
  FILE_PREVIEW_COPY,
  FILE_PREVIEW_DOCX_CONTENT_CLASS,
} from "@/constants/file-attachment";
import { useDocxPreview } from "@/hooks/use-file-preview";
import { FILE_PREVIEW_KIND } from "@/types/file-attachment";

export function FilePreviewDocx({ file }: { file: File | undefined }) {
  const { html, isLoading, hasFailed } = useDocxPreview(file);

  return (
    <FilePreviewEmbeddedBody
      contentClassName={FILE_PREVIEW_DOCX_CONTENT_CLASS}
      kind={FILE_PREVIEW_KIND.DOCX}
      file={file}
      isLoading={isLoading}
      hasFailed={hasFailed}
      loadingMessage={FILE_PREVIEW_COPY.docxPreviewLoading}
      unavailableMessage={FILE_PREVIEW_COPY.docxPreviewUnavailable}
    >
      {html ? (
        <div
          className="file-preview-docx-html"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : null}
    </FilePreviewEmbeddedBody>
  );
}
