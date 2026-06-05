"use client";

import {
  FilePreviewCodeBody,
  FilePreviewEmbeddedBody,
} from "@/components/chat/file-preview-common";
import { FILE_PREVIEW_CODE_CONTENT_CLASS } from "@/constants/file-attachment";
import { useCsvPreview } from "@/hooks/use-file-preview";
import { FILE_PREVIEW_KIND } from "@/types/file-attachment";

export function FilePreviewCsv({ file }: { file: File | undefined }) {
  const { text, isLoading, hasFailed } = useCsvPreview(file);

  return (
    <FilePreviewEmbeddedBody
      contentClassName={FILE_PREVIEW_CODE_CONTENT_CLASS}
      kind={FILE_PREVIEW_KIND.CSV}
      file={file}
      isLoading={isLoading}
      hasFailed={hasFailed}
    >
      {text ? (
        <FilePreviewCodeBody text={text} ariaLabel="CSV preview" />
      ) : null}
    </FilePreviewEmbeddedBody>
  );
}
