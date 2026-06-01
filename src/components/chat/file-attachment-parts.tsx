"use client";

import type { CSSProperties, ReactNode } from "react";
import {
  FileAudioIcon,
  FileDocumentIcon,
  FileVideoIcon,
} from "@/components/ui/icons";
import {
  COMPOSER_ATTACH_MENU_PANEL_CLASS,
  FILE_KIND_BG,
  FILE_KIND_LABEL,
  FILE_PREVIEW_COPY,
} from "@/constants/file-attachment";
import {
  FILE_PREVIEW_KIND,
  type FilePreviewKind,
  type LibraryRecentFile,
} from "@/types/file-attachment";
import { formatLibraryFileMeta } from "@/utils/file-attachment";
import { cn } from "@/utils/class-name";

function fileKindIconComponent(kind: FilePreviewKind) {
  if (kind === FILE_PREVIEW_KIND.MP4) return FileVideoIcon;
  if (kind === FILE_PREVIEW_KIND.MP3) return FileAudioIcon;
  return FileDocumentIcon;
}

export function FileKindIcon({
  kind,
  size = "md",
}: {
  kind: FilePreviewKind;
  size?: "sm" | "md";
}) {
  const Icon = fileKindIconComponent(kind);
  const box = size === "sm" ? "h-9 w-9 rounded-lg" : "h-10 w-10 rounded-xl";
  const glyph = size === "sm" ? "h-6 w-6" : "h-7 w-7";

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center text-white shadow-sm",
        box,
        FILE_KIND_BG[kind],
      )}
      aria-hidden
    >
      <Icon className={glyph} />
    </span>
  );
}

export function AttachmentMenuIcon({ children }: { children: ReactNode }) {
  return (
    <span
      className={cn(
        "grid h-9 w-9 shrink-0 place-items-center rounded-lg border",
        "border-white/10 bg-white/6 text-white/75",
        "light:border-app-border-subtle light:bg-app-surface-subtle light:text-app-fg-muted",
      )}
      aria-hidden
    >
      {children}
    </span>
  );
}

export function RecentFilesFlyout({
  recentMenuId,
  recentFiles,
  style,
  onPointerEnter,
  onPointerLeave,
}: {
  recentMenuId: string;
  recentFiles: readonly LibraryRecentFile[];
  style: CSSProperties;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
}) {
  return (
    <div onMouseEnter={onPointerEnter} onMouseLeave={onPointerLeave}>
      <div
        id={recentMenuId}
        role="group"
        aria-label={FILE_PREVIEW_COPY.recentFilesLabel}
        style={style}
        className={cn("fixed z-200 w-70", COMPOSER_ATTACH_MENU_PANEL_CLASS)}
      >
        <div className="p-1">
          {recentFiles.length === 0 ? (
            <p className="px-2.5 py-3 text-xs text-white/45 light:text-app-fg-faint">
              {FILE_PREVIEW_COPY.recentFilesEmpty}
            </p>
          ) : (
            <ul className="space-y-0.5">
              {recentFiles.map((file) => {
                const meta = formatLibraryFileMeta(file);
                return (
                  <li key={file.id}>
                    <div
                      className="flex cursor-not-allowed select-none items-center gap-2.5 rounded-xl px-2 py-2 opacity-80"
                      title={FILE_PREVIEW_COPY.recentFilesComingSoonHint}
                    >
                      <FileKindIcon kind={file.kind} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold leading-snug text-white/95 light:text-app-fg">
                          {file.name}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-white/45 light:text-app-fg-faint">
                          <span className="uppercase tracking-wide">
                            {FILE_KIND_LABEL[file.kind]}
                          </span>
                          {meta ? (
                            <span className="normal-case">{` · ${meta}`}</span>
                          ) : null}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div
          className={cn(
            "border-t px-3 py-2 text-center",
            "border-white/8 light:border-app-border-subtle",
          )}
        >
          <p className="text-[11px] font-medium uppercase tracking-wide text-white/50 light:text-app-fg-faint">
            {FILE_PREVIEW_COPY.recentFilesComingSoon}
          </p>
          <p className="mt-0.5 text-xs text-white/40 light:text-app-fg-faint">
            {FILE_PREVIEW_COPY.recentFilesComingSoonHint}
          </p>
        </div>
      </div>
    </div>
  );
}
