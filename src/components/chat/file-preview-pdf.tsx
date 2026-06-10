"use client";

import { FilePreviewAsyncEmbeddedBody } from "@/components/chat/file-preview-common";
import { FILE_PREVIEW_PDF_CONTENT_CLASS } from "@/constants/file-attachment";
import { useFileDataUrl } from "@/hooks/use-file-preview";
import {
  FILE_PREVIEW_KIND,
  type NamedRawFilePreviewProps,
} from "@/types/file-attachment";
import { withPdfEmbedParams } from "@/utils/file-preview";

export function FilePreviewPdf({ file, name }: NamedRawFilePreviewProps) {
  const { url, isLoading, hasFailed } = useFileDataUrl(file);

  return (
    <FilePreviewAsyncEmbeddedBody
      contentClassName={FILE_PREVIEW_PDF_CONTENT_CLASS}
      kind={FILE_PREVIEW_KIND.PDF}
      file={file}
      isLoading={isLoading}
      hasFailed={hasFailed}
      value={url}
    >
      {url ? (
        <iframe
          src={withPdfEmbedParams(url)}
          title={name}
          className="file-preview-pdf-frame"
        />
      ) : null}
    </FilePreviewAsyncEmbeddedBody>
  );
}
