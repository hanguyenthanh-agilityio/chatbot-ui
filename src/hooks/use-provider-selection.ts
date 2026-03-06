"use client";

import { useMemo, useState } from "react";
import { PROVIDER_STATUS } from "@/constants/chat-ui";
import type { AIProviderName } from "@/lib/ai-provider";
import { isProductionLikeClient } from "@/lib/runtime-env";
import { getErrorMessage } from "@/utils/error-message";

type ValidateOpenAIKeyResponse = {
  ok?: boolean;
  message?: string;
  details?: string;
};

type ProviderRequestBody = {
  provider: AIProviderName;
  openaiApiKey?: string;
  ollamaBaseUrl?: string;
  mcpServerUrl?: string;
};

type UseProviderSelectionResult = {
  selectedProvider: AIProviderName;
  openaiApiKeyInput: string;
  ollamaBaseUrlInput: string;
  mcpServerUrlInput: string;
  providerStatus: string;
  isOpenAISelected: boolean;
  isOpenAIReady: boolean;
  isValidatingKey: boolean;
  validationError: string | null;
  validationErrorId: number;
  openaiApiKeyForRequests?: string;
  requestBody: ProviderRequestBody;
  selectProvider: (provider: AIProviderName) => void;
  updateOpenAIApiKeyInput: (value: string) => void;
  updateOllamaBaseUrlInput: (value: string) => void;
  updateMcpServerUrlInput: (value: string) => void;
  verifyOpenAIKey: () => Promise<void>;
};

const DEFAULT_PROVIDER_BY_ENV: AIProviderName = isProductionLikeClient()
  ? "openai"
  : "ollama";
const IS_SERVER_OPENAI_READY =
  process.env.NEXT_PUBLIC_OPENAI_SERVER_READY === "true" ||
  isProductionLikeClient();

export function useProviderSelection(): UseProviderSelectionResult {
  const [selectedProvider, setSelectedProvider] = useState<AIProviderName>(
    DEFAULT_PROVIDER_BY_ENV,
  );
  const [openaiApiKeyInput, setOpenaiApiKeyInput] = useState("");
  const [ollamaBaseUrlInput, setOllamaBaseUrlInput] = useState("");
  const [mcpServerUrlInput, setMcpServerUrlInput] = useState("");
  const [verifiedOpenAIKey, setVerifiedOpenAIKey] = useState<string | null>(
    null,
  );
  const [providerStatus, setProviderStatus] = useState<string>(
    DEFAULT_PROVIDER_BY_ENV === "openai" && IS_SERVER_OPENAI_READY
      ? PROVIDER_STATUS.openaiServerDefault
      : DEFAULT_PROVIDER_BY_ENV === "openai"
        ? PROVIDER_STATUS.openaiSelected
        : PROVIDER_STATUS.ollamaDefault,
  );
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationErrorId, setValidationErrorId] = useState(0);

  function setNewValidationError(message: string) {
    setValidationError(message);
    setValidationErrorId((value) => value + 1);
  }

  const isOpenAISelected = selectedProvider === "openai";
  const isOpenAIReady =
    !isOpenAISelected || IS_SERVER_OPENAI_READY || Boolean(verifiedOpenAIKey);

  const requestBody = useMemo<ProviderRequestBody>(
    () =>
      selectedProvider === "openai"
        ? {
            provider: selectedProvider,
            openaiApiKey: verifiedOpenAIKey ?? undefined,
          }
        : {
            provider: selectedProvider,
            ollamaBaseUrl: ollamaBaseUrlInput.trim() || undefined,
            mcpServerUrl: mcpServerUrlInput.trim() || undefined,
          },
    [
      selectedProvider,
      verifiedOpenAIKey,
      ollamaBaseUrlInput,
      mcpServerUrlInput,
    ],
  );

  function selectProvider(nextProvider: AIProviderName) {
    setSelectedProvider(nextProvider);
    setValidationError(null);

    if (nextProvider === "ollama") {
      setProviderStatus(PROVIDER_STATUS.ollamaDefault);
      return;
    }

    setVerifiedOpenAIKey(null);
    setProviderStatus(
      IS_SERVER_OPENAI_READY
        ? PROVIDER_STATUS.openaiServerDefault
        : PROVIDER_STATUS.openaiSelected,
    );
  }

  function updateOpenAIApiKeyInput(nextValue: string) {
    setOpenaiApiKeyInput(nextValue);
    setValidationError(null);

    if (verifiedOpenAIKey) {
      setVerifiedOpenAIKey(null);

      if (selectedProvider === "openai") {
        setProviderStatus(
          IS_SERVER_OPENAI_READY
            ? PROVIDER_STATUS.openaiServerDefault
            : PROVIDER_STATUS.openaiSelected,
        );
      }
    }
  }

  function updateOllamaBaseUrlInput(nextValue: string) {
    setOllamaBaseUrlInput(nextValue);
    setValidationError(null);
  }

  function updateMcpServerUrlInput(nextValue: string) {
    setMcpServerUrlInput(nextValue);
    setValidationError(null);
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
    ollamaBaseUrlInput,
    mcpServerUrlInput,
    providerStatus,
    isOpenAISelected,
    isOpenAIReady,
    isValidatingKey,
    validationError,
    validationErrorId,
    openaiApiKeyForRequests: verifiedOpenAIKey ?? undefined,
    requestBody,
    selectProvider,
    updateOpenAIApiKeyInput,
    updateOllamaBaseUrlInput,
    updateMcpServerUrlInput,
    verifyOpenAIKey,
  };
}
