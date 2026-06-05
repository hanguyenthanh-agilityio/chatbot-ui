"use client";

import Image from "next/image";
import { useState } from "react";
import { FilePreviewEmbeddedBody } from "@/components/chat/file-preview-common";
import { FILE_PREVIEW_FRAME_CLASS } from "@/constants/file-attachment";
import { useFileDataUrl } from "@/hooks/use-file-preview";
import { FILE_PREVIEW_KIND } from "@/types/file-attachment";

export function FilePreviewImage({
  file,
  name,
}: {
  file: File | undefined;
  name: string;
}) {
  const { url, isLoading, hasFailed } = useFileDataUrl(file);
  const [renderFailed, setRenderFailed] = useState(false);
  const failed = hasFailed || renderFailed;

  return (
    <FilePreviewEmbeddedBody
      contentClassName=""
      kind={FILE_PREVIEW_KIND.IMAGE}
      file={file}
      isLoading={!failed && (isLoading || url == null)}
      hasFailed={failed}
    >
      {url ? (
        <div className={FILE_PREVIEW_FRAME_CLASS}>
          <Image
            src={url}
            alt={name}
            width={1600}
            height={1200}
            unoptimized
            sizes="100vw"
            onError={() => setRenderFailed(true)}
            className="h-auto w-full max-h-file-preview-image rounded-xl object-contain"
          />
        </div>
      ) : null}
    </FilePreviewEmbeddedBody>
  );
}
