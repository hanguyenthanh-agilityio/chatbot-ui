"use client";

import {
  useEffect,
  useRef,
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
  helperText?: string;
  errorMessage?: string | null;
  onInputChange: (value: string) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

export function ChatComposer({
  input,
  canSend,
  isLoading,
  isProviderReady,
  helperText,
  errorMessage,
  onInputChange,
  onSubmit,
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    <div className="border-t border-white/[.08] bg-white/[.04] backdrop-blur-[28px] px-4 py-3 sm:px-6 lg:px-8 shadow-[0_-1px_0_rgba(255,255,255,0.04),0_-8px_32px_rgba(0,0,0,0.15)]">
      <div className="mx-auto w-full max-w-3xl flex flex-col gap-2">
        {errorMessage ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3">
            <Text variant="error">{errorMessage}</Text>
          </div>
        ) : null}

        <form
          onSubmit={onSubmit}
          className="flex w-full items-center gap-3 px-[18px] py-[11px] rounded-[18px] transition-all duration-200 backdrop-blur-xl border border-white/[.11] focus-within:border-violet-500/55 bg-white/[.06] shadow-[0_4px_24px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.07)]"
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
            className="flex-1 resize-none max-h-[150px] overflow-y-auto bg-transparent text-sm leading-[1.55] outline-none border-none font-dm-sans text-white/[.88] caret-violet-500/90 placeholder:text-white/[.42] disabled:opacity-50 disabled:cursor-not-allowed"
          />

          <button
            type="submit"
            disabled={!canSend}
            aria-label={CHAT_COMPOSER_COPY.sendButtonLabel}
            className={cn(
              "self-end shrink-0 w-[38px] h-[38px] rounded-[12px] grid place-items-center transition-all duration-200",
              "disabled:opacity-30 disabled:cursor-not-allowed",
              "hover:scale-[1.07] hover:shadow-[0_6px_20px_rgba(99,60,220,0.4)]",
              canSend
                ? "bg-[linear-gradient(135deg,#7c3aed,#4f46e5,#06b6d4)] text-white"
                : "bg-white/[.37] text-white/80",
            )}
          >
            {isLoading ? (
              <span className="h-2 w-2 animate-pulse rounded-full bg-current" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            )}
          </button>
        </form>

        <Text variant="helper" className="text-center">
          {helperText ?? CHAT_COMPOSER_COPY.defaultHelperText}
        </Text>
      </div>
    </div>
  );
}
