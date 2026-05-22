"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEventHandler,
  type KeyboardEvent,
} from "react";
import { Text } from "@/components/ui/text";
import { CHAT_COMPOSER_COPY } from "@/constants/chat";
import { cn } from "@/utils/class-name";

type ChatComposerProps = {
  input: string;
  canSend: boolean;
  isLoading: boolean;
  isProviderReady: boolean;
  inputTooltip?: string;
  helperText?: string;
  errorMessage?: string | null;
  onInputChange: (value: string) => void;
  onSubmitAction: FormEventHandler<HTMLFormElement>;
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
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
  }, [input]);

  const IME_COMPOSING_KEYCODE = 229;

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    const isComposing =
      event.nativeEvent.isComposing ||
      event.nativeEvent.keyCode === IME_COMPOSING_KEYCODE;
    if (isComposing) return;
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (canSend) event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <div
      className={cn(
        "border-t border-white/8 backdrop-blur-[1.75rem] shadow-composer-bar bg-glass-composer light:border-app-border-subtle",
        "px-4 py-3 sm:px-6 lg:px-8",
      )}
    >
      <div className="mx-auto w-full max-w-3xl flex flex-col gap-2">
        {errorMessage ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3">
            <Text variant="error">{errorMessage}</Text>
          </div>
        ) : null}

        <div
          className="relative"
          onMouseEnter={() => !isProviderReady && setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={() => !isProviderReady && setShowTooltip(true)}
        >
          {showTooltip && !isProviderReady && inputTooltip && (
            <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-white shadow-lg">
              {inputTooltip}
              <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
            </div>
          )}
          <form
            onSubmit={onSubmitAction}
            className="flex w-full items-center gap-3 rounded-composer-field border border-white/13 px-4 py-2.5 shadow-composer-input backdrop-blur-xl bg-glass-input transition-all duration-200 focus-within:border-violet-400/55 light:border-app-border light:bg-app-field light:shadow-composer-field light:focus-within:border-app-border-emphasis"
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
              className="max-h-composer-textarea flex-1 resize-none overflow-y-auto border-none bg-transparent text-sm leading-[1.55] text-white/90 caret-violet-400/90 outline-none placeholder:text-white/46 disabled:cursor-not-allowed disabled:opacity-50 light:text-app-fg light:caret-app-accent light:placeholder:text-app-fg-faint"
            />

            <button
              type="submit"
              disabled={!canSend}
              aria-label={CHAT_COMPOSER_COPY.sendButtonLabel}
              className={cn(
                "self-end grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-all duration-200",
                "disabled:opacity-30 disabled:cursor-not-allowed",
                "hover:scale-[1.04] hover:shadow-btn-brand",
                canSend
                  ? "bg-btn-active text-white"
                  : "bg-btn-disabled text-white/75",
              )}
            >
              {isLoading ? (
                <span className="h-2 w-2 animate-pulse rounded-full bg-current" />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
              )}
            </button>
          </form>
        </div>

        <Text variant="helper" className="px-1 text-center">
          {helperText ?? CHAT_COMPOSER_COPY.defaultHelperText}
        </Text>
      </div>
    </div>
  );
}
