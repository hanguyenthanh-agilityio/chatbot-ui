"use client";

import { FilePreviewAsyncEmbeddedBody } from "@/components/chat/file-preview-common";
import { FILE_PREVIEW_DOCX_CONTENT_CLASS } from "@/constants/file-attachment";
import { useDocxPreview } from "@/hooks/use-file-preview";
import {
  FILE_PREVIEW_KIND,
  type RawFilePreviewProps,
} from "@/types/file-attachment";

export function FilePreviewDocx({ file }: RawFilePreviewProps) {
  const { html, isLoading, hasFailed } = useDocxPreview(file);

  return (
    <FilePreviewAsyncEmbeddedBody
      contentClassName={FILE_PREVIEW_DOCX_CONTENT_CLASS}
      kind={FILE_PREVIEW_KIND.DOCX}
      file={file}
      isLoading={isLoading}
      hasFailed={hasFailed}
      value={html}
    >
      <div
        className="file-preview-docx-html"
        dangerouslySetInnerHTML={{ __html: html! }}
      />
    </FilePreviewAsyncEmbeddedBody>
  );
}
