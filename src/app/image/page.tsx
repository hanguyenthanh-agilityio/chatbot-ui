"use client";

import { useState } from "react";
import { MediaLab } from "@/components/labs/media-lab";
import { PlaygroundNav } from "@/components/playground/playground-nav";
import { ProviderSelector } from "@/components/chat/provider-selector";
import { Modal } from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { VERIFY_KEY_HINT } from "@/constants/chat-ui";
import { useProviderSelection } from "@/hooks/use-provider-selection";
import { getDisplayErrorMessage } from "@/utils/error-message";

export default function ImagePage() {
  const [dismissedValidationErrorId, setDismissedValidationErrorId] = useState<
    number | null
  >(null);
  const provider = useProviderSelection();

  const validationErrorMessage = provider.validationError
    ? getDisplayErrorMessage(provider.validationError)
    : null;
  const showValidationErrorModal =
    Boolean(validationErrorMessage) &&
    provider.validationErrorId !== dismissedValidationErrorId;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 p-4 sm:p-6">
      <PlaygroundNav />

      <header className="space-y-1">
        <Text as="h1" variant="title">
          Image Generation Lab
        </Text>
        <Text variant="subtitle">
          Dedicated image-only page. Audio/video were removed as requested.
        </Text>
      </header>

      <ProviderSelector
        selectedProvider={provider.selectedProvider}
        openaiApiKeyInput={provider.openaiApiKeyInput}
        ollamaBaseUrlInput={provider.ollamaBaseUrlInput}
        mcpServerUrlInput={provider.mcpServerUrlInput}
        showMcpServerUrlInput={false}
        isOpenAISelected={provider.isOpenAISelected}
        isValidatingKey={provider.isValidatingKey}
        providerStatus={provider.providerStatus}
        onProviderChange={provider.selectProvider}
        onOpenAIApiKeyChange={provider.updateOpenAIApiKeyInput}
        onOllamaBaseUrlChange={provider.updateOllamaBaseUrlInput}
        onMcpServerUrlChange={provider.updateMcpServerUrlInput}
        onVerifyOpenAIKey={provider.verifyOpenAIKey}
      />

      {provider.isOpenAISelected && !provider.isOpenAIReady ? (
        <Text variant="warning">{VERIFY_KEY_HINT}</Text>
      ) : null}

      <MediaLab
        selectedProvider={provider.selectedProvider}
        openaiApiKey={provider.openaiApiKeyForRequests}
      />

      <Modal
        open={showValidationErrorModal}
        title="OpenAI validation failed"
        description={validationErrorMessage ?? undefined}
        onClose={() =>
          setDismissedValidationErrorId(provider.validationErrorId)
        }
      />
    </main>
  );
}
