"use client";

import { FilePreviewEmbeddedBody } from "@/components/chat/file-preview-common";
import { FILE_PREVIEW_FRAME_CLASS } from "@/constants/file-attachment";
import { useFileDataUrl, useFileRenderFailure } from "@/hooks/use-file-preview";
import { FILE_PREVIEW_KIND } from "@/types/file-attachment";

type MediaPreviewKind =
  | typeof FILE_PREVIEW_KIND.MP4
  | typeof FILE_PREVIEW_KIND.MP3;

function FilePreviewMediaPlayer({
  kind,
  file,
  name,
  playerClassName,
}: {
  kind: MediaPreviewKind;
  file: File | undefined;
  name: string;
  playerClassName: string;
}) {
  const { url, isLoading, hasFailed } = useFileDataUrl(file);
  const { renderFailed, handleRenderError } = useFileRenderFailure(file);
  const failed = hasFailed || renderFailed;
  const isVideo = kind === FILE_PREVIEW_KIND.MP4;

  return (
    <FilePreviewEmbeddedBody
      contentClassName=""
      kind={kind}
      file={file}
      isLoading={!failed && (isLoading || url == null)}
      hasFailed={failed}
    >
      {url ? (
        <div className={FILE_PREVIEW_FRAME_CLASS}>
          {isVideo ? (
            <video
              src={url}
              controls
              preload="metadata"
              playsInline
              className={playerClassName}
              aria-label={name}
              onError={handleRenderError}
            />
          ) : (
            <audio
              src={url}
              controls
              preload="metadata"
              className={playerClassName}
              aria-label={name}
              onError={handleRenderError}
            />
          )}
        </div>
      ) : null}
    </FilePreviewEmbeddedBody>
  );
}

export function FilePreviewMp4({
  file,
  name,
}: {
  file: File | undefined;
  name: string;
}) {
  return (
    <FilePreviewMediaPlayer
      kind={FILE_PREVIEW_KIND.MP4}
      file={file}
      name={name}
      playerClassName="file-preview-mp4"
    />
  );
}

export function FilePreviewMp3({
  file,
  name,
}: {
  file: File | undefined;
  name: string;
}) {
  return (
    <FilePreviewMediaPlayer
      kind={FILE_PREVIEW_KIND.MP3}
      file={file}
      name={name}
      playerClassName="file-preview-mp3"
    />
  );
}
