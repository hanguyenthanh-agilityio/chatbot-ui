"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ChangeEvent,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronRightIcon,
  ClockIcon,
  CloseIcon,
  FileAudioIcon,
  FileDocumentIcon,
  FileVideoIcon,
  PlusIcon,
  UploadIcon,
} from "@/components/ui/icons";
import {
  COMPOSER_ATTACH_MENU_ITEM_CLASS,
  COMPOSER_ATTACH_MENU_PANEL_CLASS,
  COMPOSER_ATTACH_TOGGLE_BUTTON_CLASS,
  FILE_KIND_BG,
  FILE_KIND_LABEL,
  FILE_PREVIEW_ACCEPT,
  FILE_PREVIEW_COPY,
  MOCK_RECENT_FILES,
} from "@/constants/file-attachment";
import {
  FILE_PREVIEW_KIND,
  type ComposerAttachment,
  type FilePreviewKind,
  type LibraryRecentFile,
} from "@/types/file-attachment";
import { formatFileSize } from "@/utils/file-attachment";
import { cn } from "@/utils/class-name";

const MENU_ITEM_LABEL_CLASS =
  "min-w-0 flex-1 text-sm font-medium leading-snug text-inherit";

const portalSubscribe = () => () => {};
const getPortalSnapshot = () => typeof document !== "undefined";
const getServerPortalSnapshot = () => false;

function fileKindIconComponent(kind: FilePreviewKind) {
  if (kind === FILE_PREVIEW_KIND.MP4) return FileVideoIcon;
  if (kind === FILE_PREVIEW_KIND.MP3) return FileAudioIcon;
  return FileDocumentIcon;
}

function FileKindIcon({
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

function MenuIcon({ children }: { children: ReactNode }) {
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

function formatRecentMeta(file: LibraryRecentFile) {
  const parts: string[] = [];
  if (file.sizeBytes != null) parts.push(formatFileSize(file.sizeBytes));
  if (file.lastUsedLabel) parts.push(file.lastUsedLabel);
  return parts.join(" · ");
}

function RecentFilesFlyout({
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
                const meta = formatRecentMeta(file);
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

export function ComposerAttachmentChip({
  file,
  onRemove,
}: {
  file: ComposerAttachment;
  onRemove: () => void;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2 rounded-xl border px-2 py-1.5",
        "border-white/12 bg-white/6 light:border-app-border light:bg-app-surface-subtle",
      )}
    >
      <FileKindIcon kind={file.kind} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold leading-snug text-white/95 light:text-app-fg">
          {file.name}
        </p>
        <p className="text-xs uppercase tracking-wide text-white/45 light:text-app-fg-faint">
          {FILE_KIND_LABEL[file.kind]}
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onRemove}
        aria-label={FILE_PREVIEW_COPY.removeAttachmentLabel(file.name)}
        className={cn(
          "h-7 w-7 min-w-7 shrink-0 p-0 text-white/50",
          "hover:bg-white/10 hover:text-white/90",
          "light:text-app-fg-faint light:hover:bg-app-hover light:hover:text-app-fg",
        )}
      >
        <CloseIcon className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

export function ComposerAttachmentMenu({
  disabled = false,
  fileInputRef,
  onOpenFilePicker,
  onFileSelected,
  recentFiles = MOCK_RECENT_FILES,
}: {
  disabled?: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onOpenFilePicker: () => void;
  onFileSelected: (file: File) => void;
  recentFiles?: readonly LibraryRecentFile[];
}) {
  const menuId = useId();
  const recentMenuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const recentTriggerRef = useRef<HTMLDivElement>(null);
  const recentCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isRecentOpen, setIsRecentOpen] = useState(false);
  const [recentFlyoutStyle, setRecentFlyoutStyle] = useState<CSSProperties>({});
  const canUsePortal = useSyncExternalStore(
    portalSubscribe,
    getPortalSnapshot,
    getServerPortalSnapshot,
  );

  const clearRecentCloseTimer = useCallback(() => {
    if (recentCloseTimerRef.current) {
      clearTimeout(recentCloseTimerRef.current);
      recentCloseTimerRef.current = null;
    }
  }, []);

  const closeMenu = useCallback(() => {
    clearRecentCloseTimer();
    setIsOpen(false);
    setIsRecentOpen(false);
  }, [clearRecentCloseTimer]);

  const openRecent = useCallback(() => {
    clearRecentCloseTimer();
    setIsRecentOpen(true);
  }, [clearRecentCloseTimer]);

  const scheduleCloseRecent = useCallback(() => {
    clearRecentCloseTimer();
    recentCloseTimerRef.current = setTimeout(() => setIsRecentOpen(false), 120);
  }, [clearRecentCloseTimer]);

  useEffect(() => () => clearRecentCloseTimer(), [clearRecentCloseTimer]);

  useLayoutEffect(() => {
    if (!isRecentOpen || !recentTriggerRef.current) return;

    const rect = recentTriggerRef.current.getBoundingClientRect();
    const gap = 6;
    const flyoutWidth = 280;
    const flyoutMaxHeight = 320;
    const padding = 8;

    let left = rect.right + gap;
    if (left + flyoutWidth > window.innerWidth - padding) {
      left = rect.left - flyoutWidth - gap;
    }

    let top = rect.top;
    if (top + flyoutMaxHeight > window.innerHeight - padding) {
      top = Math.max(padding, window.innerHeight - flyoutMaxHeight - padding);
    }

    setRecentFlyoutStyle({ top, left });
  }, [isRecentOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (document.getElementById(recentMenuId)?.contains(target)) return;
      closeMenu();
    }

    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") closeMenu();
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [isOpen, recentMenuId, closeMenu]);

  const recentFlyout =
    isRecentOpen && canUsePortal ? (
      createPortal(
        <RecentFilesFlyout
          recentMenuId={recentMenuId}
          recentFiles={recentFiles}
          style={recentFlyoutStyle}
          onPointerEnter={openRecent}
          onPointerLeave={scheduleCloseRecent}
        />,
        document.body,
      )
    ) : null;

  return (
    <div ref={rootRef} className="relative shrink-0">
      <Input
        ref={fileInputRef}
        type="file"
        accept={FILE_PREVIEW_ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          onFileSelected(file);
          closeMenu();
        }}
      />

      <Button
        type="button"
        variant="ghost"
        disabled={disabled}
        aria-label={FILE_PREVIEW_COPY.attachMenuAriaLabel}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls={isOpen ? menuId : undefined}
        title={FILE_PREVIEW_COPY.attachMenuLabel}
        onClick={() => {
          if (disabled) return;
          setIsOpen((open) => {
            if (open) setIsRecentOpen(false);
            return !open;
          });
        }}
        className={cn(
          COMPOSER_ATTACH_TOGGLE_BUTTON_CLASS,
          isOpen &&
            "border-violet-400/55 bg-white/10 light:border-app-border-emphasis",
        )}
      >
        <PlusIcon className="h-4 w-4" />
      </Button>

      {isOpen ? (
        <div
          id={menuId}
          role="menu"
          className={cn(
            "absolute bottom-full left-0 z-[120] mb-2 min-w-[15.5rem] overflow-visible p-1.5",
            COMPOSER_ATTACH_MENU_PANEL_CLASS,
          )}
        >
          <Button
            type="button"
            variant="ghost"
            role="menuitem"
            className={cn(COMPOSER_ATTACH_MENU_ITEM_CLASS, "cursor-pointer text-sm")}
            onClick={() => {
              onOpenFilePicker();
              closeMenu();
            }}
          >
            <MenuIcon>
              <UploadIcon className="h-[18px] w-[18px]" />
            </MenuIcon>
            <span className={MENU_ITEM_LABEL_CLASS}>
              {FILE_PREVIEW_COPY.addFilesLabel}
            </span>
          </Button>

          <div
            ref={recentTriggerRef}
            onMouseEnter={openRecent}
            onMouseLeave={scheduleCloseRecent}
          >
            <div
              role="menuitem"
              aria-haspopup="true"
              aria-expanded={isRecentOpen}
              aria-controls={isRecentOpen ? recentMenuId : undefined}
              className={cn(
                COMPOSER_ATTACH_MENU_ITEM_CLASS,
                "cursor-default text-sm",
                isRecentOpen && "bg-white/8 light:bg-app-hover",
              )}
            >
              <MenuIcon>
                <ClockIcon className="h-[18px] w-[18px]" />
              </MenuIcon>
              <span className={MENU_ITEM_LABEL_CLASS}>
                {FILE_PREVIEW_COPY.recentFilesLabel}
              </span>
              <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-white/45 light:text-app-fg-faint" />
            </div>
          </div>
        </div>
      ) : null}

      {recentFlyout}
    </div>
  );
}

export type { ComposerAttachment };
