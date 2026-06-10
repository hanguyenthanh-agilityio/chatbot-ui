"use client";

import type { CSSProperties } from "react";
import { FileKindIcon } from "./file-kind-icon";
import {
  COMPOSER_ATTACH_MENU_PANEL_CLASS,
  FILE_PREVIEW_COPY,
} from "@/constants/file-attachment";
import type { LibraryRecentFile } from "@/types/file-attachment";
import { formatLibraryFileMeta, getFileKindLabel } from "@/utils/file-attachment";
import { cn } from "@/utils/class-name";

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
                            {getFileKindLabel(file.kind)}
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
          <p className="text-compact-11 font-medium uppercase tracking-wide text-white/50 light:text-app-fg-faint">
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
