"use client";

import { useChat } from "@ai-sdk/react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { ChatInputForm } from "@/components/chat/chat-input-form";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ProviderSelector } from "@/components/chat/provider-selector";
import { Modal } from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { ToastViewport } from "@/components/ui/toast";
import {
  CHAT_SUBTITLE,
  CHAT_TITLE,
  SUBMITTING_HINT,
  VERIFY_KEY_HINT,
} from "@/constants/chat-ui";
import { useChatAutoScroll } from "@/hooks/use-chat-auto-scroll";
import { useProviderSelection } from "@/hooks/use-provider-selection";
import { useToast } from "@/hooks/use-toast";
import { getDisplayErrorMessage } from "@/utils/error-message";

export default function Home() {
  const [input, setInput] = useState("");
  const [dismissedValidationErrorId, setDismissedValidationErrorId] = useState<
    number | null
  >(null);
  const provider = useProviderSelection();
  const { messages, sendMessage, status, error } = useChat();
  const messagesContainerRef = useRef<HTMLElement>(null);
  const lastChatErrorRef = useRef<string | null>(null);
  const { toasts, showError, dismissToast } = useToast();

  const isSubmitting = status === "submitted";
  const isStreaming = status === "streaming";
  const isLoading = isSubmitting || isStreaming;
  const trimmedInput = input.trim();
  const canSend =
    trimmedInput.length > 0 && !isLoading && provider.isOpenAIReady;
  const validationErrorMessage = provider.validationError
    ? getDisplayErrorMessage(provider.validationError)
    : null;
  const showValidationErrorModal =
    Boolean(validationErrorMessage) &&
    provider.validationErrorId !== dismissedValidationErrorId;

  useChatAutoScroll(messagesContainerRef, messages, isStreaming);

  useEffect(() => {
    const nextErrorMessage = error ? getDisplayErrorMessage(error) : null;

    if (!nextErrorMessage) {
      lastChatErrorRef.current = null;
      return;
    }

    if (lastChatErrorRef.current === nextErrorMessage) {
      return;
    }

    lastChatErrorRef.current = nextErrorMessage;
    showError({
      title: "Chat request failed",
      description: nextErrorMessage,
    });
  }, [error, showError]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!trimmedInput) return;
    if (!provider.isOpenAIReady) return;

    void sendMessage({ text: trimmedInput }, { body: provider.requestBody });
    setInput("");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 p-4 sm:p-6">
      <header className="space-y-1">
        <Text as="h1" variant="title">
          {CHAT_TITLE}
        </Text>
        <Text variant="subtitle">{CHAT_SUBTITLE}</Text>
      </header>

      <ProviderSelector
        selectedProvider={provider.selectedProvider}
        openaiApiKeyInput={provider.openaiApiKeyInput}
        isOpenAISelected={provider.isOpenAISelected}
        isValidatingKey={provider.isValidatingKey}
        providerStatus={provider.providerStatus}
        onProviderChange={provider.selectProvider}
        onOpenAIApiKeyChange={provider.updateOpenAIApiKeyInput}
        onVerifyOpenAIKey={provider.verifyOpenAIKey}
      />

      <ChatMessages
        containerRef={messagesContainerRef}
        messages={messages}
        isSubmitting={isSubmitting}
        isStreaming={isStreaming}
      />

      {isSubmitting ? (
        <Text variant="caption" aria-live="polite">
          {SUBMITTING_HINT}
        </Text>
      ) : null}

      {provider.isOpenAISelected && !provider.isOpenAIReady ? (
        <Text variant="warning">{VERIFY_KEY_HINT}</Text>
      ) : null}

      <ChatInputForm
        input={input}
        canSend={canSend}
        isLoading={isLoading}
        isOpenAIReady={provider.isOpenAIReady}
        onInputChange={setInput}
        onSubmit={handleSubmit}
      />

      <Modal
        open={showValidationErrorModal}
        title="OpenAI validation failed"
        description={validationErrorMessage ?? undefined}
        onClose={() =>
          setDismissedValidationErrorId(provider.validationErrorId)
        }
      />

      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </main>
  );
}
