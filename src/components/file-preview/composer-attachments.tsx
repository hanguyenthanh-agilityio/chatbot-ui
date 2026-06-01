"use client";

import {
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
import {
  FILE_PREVIEW_ACCEPT,
  FILE_PREVIEW_COPY,
  MOCK_RECENT_FILES,
  formatFileSize,
  type ComposerAttachment,
  type LibraryRecentFile,
} from "@/lib/file-preview";
import {
  FileKindIcon,
  getFileKindLabel,
} from "@/components/file-preview/file-kind-icon";
import { Button } from "@/components/ui/button";
import {
  ChevronRightIcon,
  ClockIcon,
  CloseIcon,
  PlusIcon,
  UploadIcon,
} from "@/components/ui/icons";
import { cn } from "@/utils/class-name";

/** Neutralize default ghost styles so composer attachment controls keep their shell look. */
const ATTACHMENT_BUTTON_RESET = cn(
  "!h-auto !min-h-0 !w-auto !min-w-0 !rounded-none !border-0 !bg-transparent !px-0 !py-0 !font-normal !shadow-none",
  "hover:!brightness-100 light:hover:!brightness-100",
);

const MENU_PANEL_CLASS = cn(
  "rounded-2xl border shadow-panel backdrop-blur-xl",
  "border-white/12 bg-slate-900/95",
  "light:border-app-border light:bg-app-surface-raised light:shadow-panel-sm",
);

const MENU_ITEM_CLASS = cn(
  "flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors",
  "text-white/90 hover:bg-white/8",
  "light:text-app-fg light:hover:bg-app-hover",
);

const MENU_ITEM_LABEL_CLASS =
  "min-w-0 flex-1 text-sm font-medium leading-snug text-inherit";

const portalSubscribe = () => () => {};
const getPortalSnapshot = () => typeof document !== "undefined";
const getServerPortalSnapshot = () => false;

type ComposerAttachmentMenuProps = {
  disabled?: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onOpenFilePicker: () => void;
  onFileSelected: (file: File) => void;
  recentFiles?: readonly LibraryRecentFile[];
};

type ComposerAttachmentChipProps = {
  file: ComposerAttachment;
  onRemove: () => void;
};

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
  id,
  files,
  style,
}: {
  id: string;
  files: readonly LibraryRecentFile[];
  style: CSSProperties;
}) {
  return (
    <div
      id={id}
      role="group"
      aria-label={FILE_PREVIEW_COPY.recentFilesLabel}
      style={style}
      className={cn("fixed z-200 w-70", MENU_PANEL_CLASS)}
    >
      <div className="p-1">
        {files.length === 0 ? (
          <p className="px-2.5 py-3 text-xs text-white/45 light:text-app-fg-faint">
            {FILE_PREVIEW_COPY.recentFilesEmpty}
          </p>
        ) : (
          <ul className="space-y-0.5" aria-disabled>
            {files.map((file) => (
              <li key={file.id}>
                <div
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-2 py-2",
                    "cursor-not-allowed select-none opacity-80",
                  )}
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
                      {formatRecentMeta(file) ? (
                        <span className="normal-case">
                          {" · "}
                          {formatRecentMeta(file)}
                        </span>
                      ) : null}
                    </p>
                  </div>
                </div>
              </li>
            ))}
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
  );
}

export function ComposerAttachmentChip({ file, onRemove }: ComposerAttachmentChipProps) {
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
          {getFileKindLabel(file.kind)}
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        onClick={onRemove}
        aria-label={FILE_PREVIEW_COPY.removeAttachmentLabel(file.name)}
        className={cn(
          ATTACHMENT_BUTTON_RESET,
          "grid h-7 w-7 shrink-0 place-items-center rounded-lg text-white/50 transition-colors",
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
}: ComposerAttachmentMenuProps) {
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

  useEffect(() => () => clearRecentCloseTimer(), []);

  useLayoutEffect(() => {
    if (!isRecentOpen || !recentTriggerRef.current) {
      return;
    }

    function updatePosition() {
      const trigger = recentTriggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const gap = 6;
      const flyoutWidth = 280;
      const flyoutMaxHeight = 320;
      const viewportPadding = 8;

      let left = rect.right + gap;
      if (left + flyoutWidth > window.innerWidth - viewportPadding) {
        left = rect.left - flyoutWidth - gap;
      }

      let top = rect.top;
      if (top + flyoutMaxHeight > window.innerHeight - viewportPadding) {
        top = Math.max(
          viewportPadding,
          window.innerHeight - flyoutMaxHeight - viewportPadding,
        );
      }

      setRecentFlyoutStyle({
        top,
        left,
      });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isRecentOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      const flyout = document.getElementById(recentMenuId);
      if (flyout?.contains(target)) return;
      setIsOpen(false);
      setIsRecentOpen(false);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        setIsRecentOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, recentMenuId]);

  function clearRecentCloseTimer() {
    if (recentCloseTimerRef.current) {
      clearTimeout(recentCloseTimerRef.current);
      recentCloseTimerRef.current = null;
    }
  }

  function openRecentFlyout() {
    clearRecentCloseTimer();
    setIsRecentOpen(true);
  }

  function scheduleCloseRecentFlyout() {
    clearRecentCloseTimer();
    recentCloseTimerRef.current = setTimeout(() => {
      setIsRecentOpen(false);
      recentCloseTimerRef.current = null;
    }, 120);
  }

  function closeMenu() {
    clearRecentCloseTimer();
    setIsOpen(false);
    setIsRecentOpen(false);
  }

  function handleToggleMenu() {
    if (disabled) return;
    setIsOpen((open) => {
      if (open) setIsRecentOpen(false);
      return !open;
    });
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    onFileSelected(file);
    closeMenu();
  }

  const recentFlyout =
    isRecentOpen && canUsePortal ? (
      createPortal(
        <div
          onMouseEnter={openRecentFlyout}
          onMouseLeave={scheduleCloseRecentFlyout}
        >
          <RecentFilesFlyout id={recentMenuId} files={recentFiles} style={recentFlyoutStyle} />
        </div>,
        document.body,
      )
    ) : null;

  return (
    <div ref={rootRef} className="relative shrink-0">
      <input
        ref={fileInputRef}
        type="file"
        accept={FILE_PREVIEW_ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={handleFileChange}
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
        onClick={handleToggleMenu}
        className={cn(
          ATTACHMENT_BUTTON_RESET,
          "grid h-10 w-10 min-h-10 min-w-10 cursor-pointer place-items-center rounded-xl border transition-colors duration-200",
          "border-white/12 bg-white/6 text-white/80 hover:border-violet-400/45 hover:bg-white/10",
          "disabled:cursor-not-allowed disabled:opacity-40",
          "light:border-app-border light:bg-app-surface-subtle light:text-app-fg-muted light:hover:border-app-border-emphasis light:hover:bg-app-hover",
          isOpen && "border-violet-400/55 bg-white/10 light:border-app-border-emphasis",
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
            MENU_PANEL_CLASS,
          )}
        >
          <Button
            type="button"
            variant="ghost"
            role="menuitem"
            className={cn(
              ATTACHMENT_BUTTON_RESET,
              MENU_ITEM_CLASS,
              "w-full cursor-pointer text-sm",
            )}
            onClick={() => {
              onOpenFilePicker();
              closeMenu();
            }}
          >
            <MenuIcon>
              <UploadIcon className="h-[18px] w-[18px]" />
            </MenuIcon>
            <span className={MENU_ITEM_LABEL_CLASS}>{FILE_PREVIEW_COPY.addFilesLabel}</span>
          </Button>

          <div
            ref={recentTriggerRef}
            onMouseEnter={openRecentFlyout}
            onMouseLeave={scheduleCloseRecentFlyout}
          >
            <div
              role="menuitem"
              aria-haspopup="true"
              aria-expanded={isRecentOpen}
              aria-controls={isRecentOpen ? recentMenuId : undefined}
              className={cn(
                MENU_ITEM_CLASS,
                "cursor-default text-sm",
                isRecentOpen && "bg-white/8 light:bg-app-hover",
              )}
              onClick={() => {
                clearRecentCloseTimer();
                setIsRecentOpen((open) => !open);
              }}
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
