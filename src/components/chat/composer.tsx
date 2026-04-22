"use client";

import {
  useEffect,
  useRef,
  type FormEventHandler,
  type KeyboardEvent,
} from "react";
import { Button } from "@/components/ui/button";
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

    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 220)}px`;
  }, [input]);

  // keyCode 229 is the legacy IME composition indicator on some browsers.
  const IME_COMPOSING_KEYCODE = 229;

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    const isComposing =
      event.nativeEvent.isComposing ||
      event.nativeEvent.keyCode === IME_COMPOSING_KEYCODE;

    if (isComposing) {
      return;
    }

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (canSend) {
        event.currentTarget.form?.requestSubmit();
      }
    }
  }

  return (
    <div className="border-t border-slate-200 bg-white/90 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl">
        {errorMessage ? (
          <div className="mb-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <form
          onSubmit={onSubmit}
          className="rounded-[1.75rem] border border-slate-200 bg-white shadow-lg shadow-slate-900/5"
        >
          <div className="flex items-end gap-3 px-4 py-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => onInputChange(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={CHAT_COMPOSER_COPY.placeholder}
              aria-label={CHAT_COMPOSER_COPY.ariaLabel}
              disabled={!isProviderReady}
              rows={1}
              className={cn(
                "max-h-56 min-h-[28px] flex-1 resize-none bg-transparent text-[15px] leading-7 text-slate-900 outline-none placeholder:text-slate-400",
                "disabled:cursor-not-allowed disabled:opacity-60",
              )}
            />

            <Button
              type="submit"
              disabled={!canSend}
              variant="primary"
              size="md"
              className="shrink-0 rounded-2xl px-4"
            >
              {!isProviderReady
                ? CHAT_COMPOSER_COPY.verifyFirstButtonLabel
                : isLoading
                  ? CHAT_COMPOSER_COPY.thinkingButtonLabel
                  : CHAT_COMPOSER_COPY.sendButtonLabel}
            </Button>
          </div>
        </form>

        <Text variant="caption" className="mt-3 block px-1 text-slate-500">
          {helperText ?? CHAT_COMPOSER_COPY.defaultHelperText}
        </Text>
      </div>
    </div>
  );
}
