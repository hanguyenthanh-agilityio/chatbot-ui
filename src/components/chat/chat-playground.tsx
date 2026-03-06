"use client";

import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import { FormEvent, useEffect, useRef, useState } from "react";
import { ChatInputForm } from "@/components/chat/chat-input-form";
import { FeatureSelector } from "@/components/chat/feature-selector";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ProviderSelector } from "@/components/chat/provider-selector";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { ToastViewport } from "@/components/ui/toast";
import {
  DEFAULT_CHAT_FEATURE_MODE,
  type ChatFeatureMode,
} from "@/constants/ai-feature";
import {
  CHAT_SUBTITLE,
  CHAT_TITLE,
  SUBMITTING_HINT,
  VERIFY_KEY_HINT,
} from "@/constants/chat-ui";
import { useChatAutoScroll } from "@/hooks/use-chat-auto-scroll";
import { useChatHistoryPersistence } from "@/hooks/use-chat-history-persistence";
import { useProviderSelection } from "@/hooks/use-provider-selection";
import { isProductionLikeClient } from "@/lib/runtime-env";
import { useToast } from "@/hooks/use-toast";
import { getDisplayErrorMessage } from "@/utils/error-message";

export function ChatPlayground() {
  const [input, setInput] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [featureMode, setFeatureMode] = useState<ChatFeatureMode>(
    DEFAULT_CHAT_FEATURE_MODE,
  );
  const [dismissedValidationErrorId, setDismissedValidationErrorId] = useState<
    number | null
  >(null);
  const provider = useProviderSelection();
  const { messages, setMessages, sendMessage, addToolOutput, status, error } =
    useChat({
      transport: new DefaultChatTransport({
        api: "/api/chat",
      }),
      // Auto-continue when tool outputs are all available.
      sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
      onToolCall: ({ toolCall }) => {
        if (toolCall.dynamic) {
          return;
        }

        if (toolCall.toolName === "getClientContext") {
          addToolOutput({
            tool: "getClientContext",
            toolCallId: toolCall.toolCallId,
            output: {
              locale: navigator.language,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              localTimeIso: new Date().toISOString(),
            },
          });
        }
      },
    });
  const { clearHistory } = useChatHistoryPersistence(messages, setMessages);
  const messagesContainerRef = useRef<HTMLElement>(null);
  const lastChatErrorRef = useRef<string | null>(null);
  const { toasts, showError, dismissToast } = useToast();
  const isMcpDisabledForProvider = provider.selectedProvider === "openai";
  const showMcpServerUrlInput =
    isProductionLikeClient() &&
    provider.selectedProvider === "ollama" &&
    featureMode === "mcp";

  const isSubmitting = status === "submitted";
  const isStreaming = status === "streaming";
  const isLoading = isSubmitting || isStreaming;
  const trimmedInput = input.trim();
  const hasAttachedFiles = attachedFiles.length > 0;
  const canSend =
    (trimmedInput.length > 0 || hasAttachedFiles) &&
    !isLoading &&
    provider.isOpenAIReady;
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

  function handleProviderChange(
    nextProvider: Parameters<typeof provider.selectProvider>[0],
  ) {
    if (nextProvider === "openai" && featureMode === "mcp") {
      setFeatureMode(DEFAULT_CHAT_FEATURE_MODE);
    }

    provider.selectProvider(nextProvider);
  }

  function filesToFileList(files: File[]): FileList {
    const dataTransfer = new DataTransfer();
    files.forEach((file) => dataTransfer.items.add(file));
    return dataTransfer.files;
  }

  function addAttachedFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    setAttachedFiles((currentFiles) => {
      const nextFiles = [...currentFiles];
      const existingIds = new Set(
        currentFiles.map(
          (file) => `${file.name}:${file.size}:${file.lastModified}`,
        ),
      );

      for (const file of Array.from(files)) {
        const fileId = `${file.name}:${file.size}:${file.lastModified}`;

        if (!existingIds.has(fileId)) {
          nextFiles.push(file);
          existingIds.add(fileId);
        }
      }

      return nextFiles;
    });
  }

  function removeAttachedFile(index: number) {
    setAttachedFiles((currentFiles) =>
      currentFiles.filter((_, fileIndex) => fileIndex !== index),
    );
  }

  function clearAttachedFiles() {
    setAttachedFiles([]);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!trimmedInput && !hasAttachedFiles) return;
    if (!provider.isOpenAIReady) return;

    const filesForSend = hasAttachedFiles
      ? filesToFileList(attachedFiles)
      : undefined;

    const outgoingMessage = trimmedInput
      ? { text: trimmedInput, files: filesForSend }
      : { files: filesForSend! };

    void sendMessage(outgoingMessage, {
      body: {
        ...provider.requestBody,
        featureMode,
      },
    });

    setInput("");
    setAttachedFiles([]);
  }

  return (
    <>
      <header className="space-y-2">
        <Text as="h1" variant="title">
          {CHAT_TITLE}
        </Text>
        <Text variant="subtitle">{CHAT_SUBTITLE}</Text>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearHistory}
            disabled={messages.length === 0 || isLoading}
          >
            Clear chat history
          </Button>
          <Text variant="caption">
            History persistence: localStorage enabled
          </Text>
        </div>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          <ProviderSelector
            selectedProvider={provider.selectedProvider}
            openaiApiKeyInput={provider.openaiApiKeyInput}
            ollamaBaseUrlInput={provider.ollamaBaseUrlInput}
            mcpServerUrlInput={provider.mcpServerUrlInput}
            showMcpServerUrlInput={showMcpServerUrlInput}
            isOpenAISelected={provider.isOpenAISelected}
            isValidatingKey={provider.isValidatingKey}
            providerStatus={provider.providerStatus}
            withContainer={false}
            onProviderChange={handleProviderChange}
            onOpenAIApiKeyChange={provider.updateOpenAIApiKeyInput}
            onOllamaBaseUrlChange={provider.updateOllamaBaseUrlInput}
            onMcpServerUrlChange={provider.updateMcpServerUrlInput}
            onVerifyOpenAIKey={provider.verifyOpenAIKey}
          />

          <FeatureSelector
            selectedFeature={featureMode}
            withContainer={false}
            disabledFeatures={isMcpDisabledForProvider ? ["mcp"] : []}
            onFeatureChange={setFeatureMode}
          />
        </div>
      </section>

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
        attachedFiles={attachedFiles}
        onInputChange={setInput}
        onAddFiles={addAttachedFiles}
        onRemoveAttachedFile={removeAttachedFile}
        onClearAttachedFiles={clearAttachedFiles}
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
    </>
  );
}
