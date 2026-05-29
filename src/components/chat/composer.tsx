"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEventHandler,
  type KeyboardEvent,
} from "react";

// Components
import { Text } from "@/components/ui/text";

// Constants
import { CHAT_COMPOSER_COPY } from "@/constants/chat";
import {
  COMPOSER_STOP_BUTTON_CLASS,
  FORM_FIELD_PANEL_CLASSES,
} from "@/constants/theme";

// Utils
import { cn } from "@/utils/class-name";

const COMPOSER_TEXTAREA_MAX_HEIGHT_PX = 150;

function syncComposerTextareaHeight(textarea: HTMLTextAreaElement) {
  textarea.style.height = "auto";
  const scrollHeight = textarea.scrollHeight;
  const height = Math.min(scrollHeight, COMPOSER_TEXTAREA_MAX_HEIGHT_PX);
  textarea.style.height = `${height}px`;
  textarea.style.overflowY =
    scrollHeight > COMPOSER_TEXTAREA_MAX_HEIGHT_PX ? "auto" : "hidden";

  const lineHeight = Number.parseFloat(getComputedStyle(textarea).lineHeight);
  const singleLineHeight = Number.isFinite(lineHeight) ? lineHeight : 22;
  return (
    textarea.value.includes("\n") || scrollHeight > singleLineHeight * 1.25
  );
}

export type ChatComposerProps = {
  input: string;
  canSend: boolean;
  isLoading: boolean;
  isProviderReady: boolean;
  inputTooltip?: string;
  helperText?: string;
  errorMessage?: string | null;
  onInputChange: (value: string) => void;
  onSubmitAction: FormEventHandler<HTMLFormElement>;
  onStopAction: () => void;
};

export function ChatComposer({
  input,
  canSend,
  isLoading,
  isProviderReady,
  inputTooltip,
  helperText,
  errorMessage,
  onInputChange,
  onSubmitAction,
  onStopAction,
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isMultiline, setIsMultiline] = useState(false);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const syncLayout = () => {
      setIsMultiline(syncComposerTextareaHeight(textarea));
    };

    syncLayout();

    if (typeof ResizeObserver === "undefined") return;

    const resizeObserver = new ResizeObserver(syncLayout);
    resizeObserver.observe(textarea);

    return () => resizeObserver.disconnect();
  }, [input]);

  const IME_COMPOSING_KEYCODE = 229;

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    const isComposing =
      event.nativeEvent.isComposing ||
      event.nativeEvent.keyCode === IME_COMPOSING_KEYCODE;
    if (isComposing) return;
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!isLoading && canSend) event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <div
      className={cn(
        "border-t border-white/8 backdrop-blur-shell shadow-composer-bar bg-glass-composer light:border-app-border-subtle light:backdrop-blur-none",
        "px-4 py-3 sm:px-6 lg:px-8",
      )}
    >
      <div className="flex w-full min-w-0 max-w-none flex-col gap-2">
        {errorMessage ? (
          <div
            className={
              "rounded-2xl px-4 py-3 border border-red-500/30 bg-red-500/10 text-red-400 light:border-app-danger-border light:bg-app-danger-bg light:text-app-danger-fg"
            }
          >
            <Text variant="error">{errorMessage}</Text>
          </div>
        ) : null}

        <div
          className={cn(
            "relative min-w-0 w-full",
            !isProviderReady && "cursor-pointer",
          )}
          onMouseEnter={() => !isProviderReady && setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={() => !isProviderReady && setShowTooltip(true)}
        >
          {showTooltip && !isProviderReady && inputTooltip ? (
            <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/12 bg-slate-800 px-3 py-1.5 text-xs text-white shadow-lg light:border-app-border light:bg-app-surface-muted light:text-app-fg light:shadow-panel-sm">
              {inputTooltip}
              <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-slate-800 light:border-t-app-border-muted" />
            </div>
          ) : null}
          <form
            onSubmit={onSubmitAction}
            className={cn(
              "flex w-full min-w-0 gap-3 rounded-composer-field px-4 py-2.5 shadow-composer-input backdrop-blur-xl bg-glass-input transition-all duration-200",
              isMultiline ? "items-end" : "items-center",
              FORM_FIELD_PANEL_CLASSES,
              "focus-within:border-violet-400/55 focus-within:ring-2 focus-within:ring-violet-400/20 light:focus-within:border-app-border-emphasis light:focus-within:ring-amber-700/25",
            )}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => onInputChange(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={CHAT_COMPOSER_COPY.placeholder}
              aria-label={CHAT_COMPOSER_COPY.ariaLabel}
              disabled={!isProviderReady}
              rows={1}
              wrap="soft"
              className="max-h-composer-textarea min-w-0 w-full flex-1 resize-none overflow-x-hidden overflow-y-hidden break-words border-none bg-transparent py-0 text-sm leading-composer text-white/90 caret-violet-400/90 outline-none placeholder:text-white/46 disabled:cursor-not-allowed disabled:opacity-50 light:text-app-fg light:caret-app-accent light:placeholder:text-app-fg-faint"
            />

            <div className="flex shrink-0">
              {isLoading ? (
                <button
                  type="button"
                  onClick={onStopAction}
                  aria-label={CHAT_COMPOSER_COPY.stopButtonLabel}
                  className={cn(
                    COMPOSER_STOP_BUTTON_CLASS,
                    "grid h-10 w-10 min-h-10 min-w-10 place-items-center",
                  )}
                >
                  <span className="composer-stop-button-icon" aria-hidden />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!canSend}
                  aria-label={CHAT_COMPOSER_COPY.sendButtonLabel}
                  className={cn(
                    "grid h-10 w-10 min-h-10 min-w-10 cursor-pointer place-items-center rounded-xl transition-all duration-200",
                    "disabled:cursor-not-allowed disabled:opacity-30",
                    "hover:scale-hover-btn hover:shadow-btn-brand",
                    canSend
                      ? "bg-btn-active text-white light:hover:brightness-105"
                      : "bg-btn-disabled text-white/75 light:bg-app-btn-brand-disabled light:text-white/85",
                  )}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                  </svg>
                </button>
              )}
            </div>
          </form>
        </div>

        <Text variant="helper" className="px-1 text-center">
          {helperText ?? CHAT_COMPOSER_COPY.defaultHelperText}
        </Text>
      </div>
    </div>
  );
}
