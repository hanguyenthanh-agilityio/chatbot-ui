"use client";

import Image from "next/image";
import { useState } from "react";
import { FilePreviewUnavailable } from "@/components/chat/file-preview-common";
import {
  FILE_PREVIEW_COPY,
  FILE_PREVIEW_FRAME_CLASS,
} from "@/constants/file-attachment";
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
  const showImage = url != null && !hasFailed && !renderFailed;

  if (!file || hasFailed) {
    return (
      <FilePreviewUnavailable
        kind={FILE_PREVIEW_KIND.IMAGE}
        message={FILE_PREVIEW_COPY.imagePreviewUnavailable}
      />
    );
  }

  if (isLoading || !showImage) {
    return (
      <FilePreviewUnavailable
        kind={FILE_PREVIEW_KIND.IMAGE}
        message={FILE_PREVIEW_COPY.imagePreviewUnavailable}
      />
    );
  }

  return (
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
  );
}
