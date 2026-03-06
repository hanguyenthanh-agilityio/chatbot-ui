"use client";

import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import { FormEvent, useEffect, useRef, useState } from "react";
import { ChatInputForm } from "@/components/chat/chat-input-form";
import { FeatureSelector } from "@/components/chat/feature-selector";
import {
  ChatMessages,
  type ChatRequestFailure,
} from "@/components/chat/chat-messages";
import { ProviderSelector } from "@/components/chat/provider-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  VERIFY_PROVIDER_URL_HINT,
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
  const provider = useProviderSelection({
    requireMcpServerUrl: featureMode === "mcp",
    requireOpenAIApiKeyVerification: true,
  });
  const {
    messages,
    setMessages,
    sendMessage,
    regenerate,
    clearError,
    addToolOutput,
    status,
    error,
  } = useChat({
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
  const { clearHistory } = useChatHistoryPersistence(
    messages,
    setMessages,
    provider.selectedProvider,
  );
  const messagesContainerRef = useRef<HTMLElement>(null);
  const lastChatErrorRef = useRef<string | null>(null);
  const [requestFailures, setRequestFailures] = useState<ChatRequestFailure[]>(
    [],
  );
  const [retryingFailureId, setRetryingFailureId] = useState<string | null>(
    null,
  );
  const [lastSubmittedRequestBody, setLastSubmittedRequestBody] = useState<{
    provider: string;
    featureMode: ChatFeatureMode;
    openaiApiKey?: string;
    ollamaBaseUrl?: string;
    mcpServerUrl?: string;
  } | null>(null);
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
    provider.isProviderReady;
  const statusHintMessage = isSubmitting
    ? SUBMITTING_HINT
    : provider.isOpenAISelected && !provider.isOpenAIReady
      ? VERIFY_KEY_HINT
      : !provider.isOpenAISelected && !provider.isProviderReady
        ? VERIFY_PROVIDER_URL_HINT
        : "";
  const statusHintVariant =
    isSubmitting || !statusHintMessage ? "caption" : "warning";
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

    const nextErrorSignature = `${nextErrorMessage}::${messages.length}`;
    if (lastChatErrorRef.current === nextErrorSignature) {
      return;
    }

    lastChatErrorRef.current = nextErrorSignature;

    const latestUserMessage = [...messages]
      .reverse()
      .find((message) => message.role === "user");

    setRequestFailures((current) => [
      ...current,
      {
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${current.length + 1}`,
        message: nextErrorMessage,
        messageId: latestUserMessage?.id,
        retriedCount: 0,
      },
    ]);

    showError({
      title: "Chat request failed",
      description: nextErrorMessage,
    });
  }, [error, messages, showError]);

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
    if (!provider.isProviderReady) return;

    const filesForSend = hasAttachedFiles
      ? filesToFileList(attachedFiles)
      : undefined;

    const outgoingMessage = trimmedInput
      ? { text: trimmedInput, files: filesForSend }
      : { files: filesForSend! };

    const requestBody = {
      ...provider.requestBody,
      featureMode,
    };

    setLastSubmittedRequestBody(requestBody);
    clearError();

    void sendMessage(outgoingMessage, {
      body: requestBody,
    });

    setInput("");
    setAttachedFiles([]);
  }

  async function handleRetryFailure(failureId: string) {
    const failure = requestFailures.find((item) => item.id === failureId);
    if (!failure?.messageId || !lastSubmittedRequestBody) return;

    setRetryingFailureId(failureId);
    clearError();

    try {
      await regenerate({
        messageId: failure.messageId,
        body: lastSubmittedRequestBody,
      });

      setRequestFailures((current) =>
        current.map((item) =>
          item.id === failureId
            ? { ...item, retriedCount: item.retriedCount + 1 }
            : item,
        ),
      );
    } catch (retryError) {
      showError({
        title: "Retry failed",
        description: getDisplayErrorMessage(retryError),
      });
    } finally {
      setRetryingFailureId(null);
    }
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
            History persistence: localStorage enabled (separate per provider)
          </Text>
        </div>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          <ProviderSelector
            selectedProvider={provider.selectedProvider}
            openaiApiKeyInput={provider.openaiApiKeyInput}
            ollamaBaseUrlInput={provider.ollamaBaseUrlInput}
            isOpenAISelected={provider.isOpenAISelected}
            isValidatingKey={provider.isValidatingKey}
            isValidatingOllamaBaseUrl={provider.isValidatingOllamaBaseUrl}
            providerStatus={provider.providerStatus}
            withContainer={false}
            onProviderChange={handleProviderChange}
            onOpenAIApiKeyChange={provider.updateOpenAIApiKeyInput}
            onOllamaBaseUrlChange={provider.updateOllamaBaseUrlInput}
            onVerifyOpenAIKey={provider.verifyOpenAIKey}
            onVerifyOllamaBaseUrl={provider.verifyOllamaBaseUrl}
          />

          <div className="flex flex-col gap-2">
            <FeatureSelector
              selectedFeature={featureMode}
              withContainer={false}
              disabledFeatures={isMcpDisabledForProvider ? ["mcp"] : []}
              onFeatureChange={setFeatureMode}
            />

            {showMcpServerUrlInput ? (
              <div className="flex flex-col gap-2">
                <Input
                  type="url"
                  value={provider.mcpServerUrlInput}
                  onChange={(event) =>
                    provider.updateMcpServerUrlInput(event.target.value)
                  }
                  placeholder="MCP server URL (e.g. https://your-mcp.example.com) — /mcp auto-added"
                  fullWidth
                  controlSize="md"
                  variant="default"
                />
                <Button
                  type="button"
                  onClick={provider.verifyMcpServerUrl}
                  isLoading={provider.isValidatingMcpServerUrl}
                  variant="primary"
                  size="md"
                >
                  {provider.isValidatingMcpServerUrl
                    ? "Verifying..."
                    : "Verify MCP URL"}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <ChatMessages
        containerRef={messagesContainerRef}
        messages={messages}
        isSubmitting={isSubmitting}
        isStreaming={isStreaming}
        requestFailures={requestFailures}
        retryingFailureId={retryingFailureId}
        onRetryFailure={handleRetryFailure}
      />

      <Text
        variant={statusHintVariant}
        aria-live="polite"
        className={!statusHintMessage ? "text-transparent" : undefined}
      >
        {statusHintMessage || "\u00A0"}
      </Text>

      <ChatInputForm
        input={input}
        canSend={canSend}
        isLoading={isLoading}
        isProviderReady={provider.isProviderReady}
        attachedFiles={attachedFiles}
        onInputChange={setInput}
        onAddFiles={addAttachedFiles}
        onRemoveAttachedFile={removeAttachedFile}
        onClearAttachedFiles={clearAttachedFiles}
        onSubmit={handleSubmit}
      />

      <Modal
        open={showValidationErrorModal}
        title="Provider validation failed"
        description={validationErrorMessage ?? undefined}
        onClose={() =>
          setDismissedValidationErrorId(provider.validationErrorId)
        }
      />

      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
