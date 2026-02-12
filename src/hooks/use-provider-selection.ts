"use client";

import { useMemo, useState } from "react";
import { PROVIDER_STATUS } from "@/constants/chat-ui";
import type { AIProviderName } from "@/lib/ai-provider";
import { getErrorMessage } from "@/utils/error-message";

type ValidateOpenAIKeyResponse = {
  ok?: boolean;
  message?: string;
  details?: string;
};

type ProviderRequestBody = {
  provider: AIProviderName;
  openaiApiKey?: string;
};

type UseProviderSelectionResult = {
  selectedProvider: AIProviderName;
  openaiApiKeyInput: string;
  providerStatus: string;
  isOpenAISelected: boolean;
  isOpenAIReady: boolean;
  isValidatingKey: boolean;
  validationError: string | null;
  validationErrorId: number;
  requestBody: ProviderRequestBody;
  selectProvider: (provider: AIProviderName) => void;
  updateOpenAIApiKeyInput: (value: string) => void;
  verifyOpenAIKey: () => Promise<void>;
};

export function useProviderSelection(): UseProviderSelectionResult {
  const [selectedProvider, setSelectedProvider] =
    useState<AIProviderName>("ollama");
  const [openaiApiKeyInput, setOpenaiApiKeyInput] = useState("");
  const [verifiedOpenAIKey, setVerifiedOpenAIKey] = useState<string | null>(
    null,
  );
  const [providerStatus, setProviderStatus] = useState<string>(
    PROVIDER_STATUS.ollamaDefault,
  );
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationErrorId, setValidationErrorId] = useState(0);

  function setNewValidationError(message: string) {
    setValidationError(message);
    setValidationErrorId((value) => value + 1);
  }

  const isOpenAISelected = selectedProvider === "openai";
  const isOpenAIReady = !isOpenAISelected || Boolean(verifiedOpenAIKey);

  const requestBody = useMemo<ProviderRequestBody>(
    () =>
      selectedProvider === "openai"
        ? {
            provider: selectedProvider,
            openaiApiKey: verifiedOpenAIKey ?? undefined,
          }
        : { provider: selectedProvider },
    [selectedProvider, verifiedOpenAIKey],
  );

  function selectProvider(nextProvider: AIProviderName) {
    setSelectedProvider(nextProvider);
    setValidationError(null);

    if (nextProvider === "ollama") {
      setProviderStatus(PROVIDER_STATUS.ollamaDefault);
      return;
    }

    setVerifiedOpenAIKey(null);
    setProviderStatus(PROVIDER_STATUS.openaiSelected);
  }

  function updateOpenAIApiKeyInput(nextValue: string) {
    setOpenaiApiKeyInput(nextValue);
    setValidationError(null);

    if (verifiedOpenAIKey) {
      setVerifiedOpenAIKey(null);

      if (selectedProvider === "openai") {
        setProviderStatus(PROVIDER_STATUS.openaiSelected);
      }
    }
  }

  async function verifyOpenAIKey() {
    const key = openaiApiKeyInput.trim();
    if (!key) {
      setProviderStatus(PROVIDER_STATUS.openaiKeyRequired);
      return;
    }

    setValidationError(null);
    setIsValidatingKey(true);
    setProviderStatus(PROVIDER_STATUS.verifyingOpenAIKey);

    try {
      const response = await fetch("/api/validate-openai-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: key }),
      });

      const data = (await response.json()) as ValidateOpenAIKeyResponse;

      if (response.ok && data.ok) {
        setVerifiedOpenAIKey(key);
        setSelectedProvider("openai");
        setProviderStatus(PROVIDER_STATUS.openaiVerified);
        setValidationError(null);
        return;
      }

      setSelectedProvider("ollama");
      setVerifiedOpenAIKey(null);
      setOpenaiApiKeyInput("");
      setProviderStatus(PROVIDER_STATUS.openaiInvalidFallback);
      setNewValidationError(
        data.details ?? data.message ?? PROVIDER_STATUS.openaiInvalidFallback,
      );
    } catch (error) {
      setSelectedProvider("ollama");
      setVerifiedOpenAIKey(null);
      setOpenaiApiKeyInput("");
      setProviderStatus(
        `${PROVIDER_STATUS.openaiInvalidFallback} ${getErrorMessage(error)}`,
      );
      setNewValidationError(getErrorMessage(error));
    } finally {
      setIsValidatingKey(false);
    }
  }

  return {
    selectedProvider,
    openaiApiKeyInput,
    providerStatus,
    isOpenAISelected,
    isOpenAIReady,
    isValidatingKey,
    validationError,
    validationErrorId,
    requestBody,
    selectProvider,
    updateOpenAIApiKeyInput,
    verifyOpenAIKey,
  };
}
