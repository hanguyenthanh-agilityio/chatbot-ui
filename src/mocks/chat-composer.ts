import type { FormEvent } from "react";
import { CHAT_COMPOSER_COPY } from "@/constants/chat";
import type { ChatComposerProps } from "@/components/chat/composer";

const noop = () => {};

export function mockChatComposerProps(
  overrides: Partial<ChatComposerProps> = {},
): ChatComposerProps {
  return {
    input: "",
    canSend: false,
    isLoading: false,
    isProviderReady: true,
    onInputChange: noop,
    onSubmitAction: (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
    },
    ...overrides,
  };
}

export const MOCK_COMPOSER_TOOLTIP = CHAT_COMPOSER_COPY.verifyProviderTooltip;
