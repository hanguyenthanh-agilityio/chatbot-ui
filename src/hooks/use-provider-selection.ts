"use client";

import { useEffect, useMemo, useState } from "react";
import { PROVIDER_STATUS } from "@/constants/ui";
import { isAIProviderName, type AIProviderName } from "@/lib/ai-provider";
import { normalizeOllamaBaseUrl } from "@/lib/ollama-url";
import { isProductionLikeClient } from "@/lib/runtime-env";
import { session as sessionStorage } from "@/utils/storage";
import { getErrorMessage } from "@/utils/error-message";

type ValidateOpenAIKeyResponse = {
  ok?: boolean;
  message?: string;
  details?: string;
};

type ValidateUrlResponse = {
  ok?: boolean;
  message?: string;
  details?: string;
  normalizedBaseUrl?: string;
};

type ProviderRequestBody = {
  provider: AIProviderName;
  openaiApiKey?: string;
  ollamaBaseUrl?: string;
};

type UseProviderSelectionOptions = {
  requireOpenAIApiKeyVerification?: boolean;
  defaultProvider?: AIProviderName;
};

type UseProviderSelectionResult = {
  selectedProvider: AIProviderName;
  openaiApiKeyInput: string;
  ollamaBaseUrlInput: string;
  providerStatus: string;
  isOpenAISelected: boolean;
  isOpenAIReady: boolean;
  isProviderReady: boolean;
  isValidatingKey: boolean;
  isValidatingOllamaBaseUrl: boolean;
  validationError: string | null;
  requestBody: ProviderRequestBody;
  selectProvider: (provider: AIProviderName) => void;
  updateOpenAIApiKeyInput: (value: string) => void;
  updateOllamaBaseUrlInput: (value: string) => void;
  verifyOpenAIKey: () => Promise<void>;
  verifyOllamaBaseUrl: () => Promise<void>;
};

const DEFAULT_PROVIDER_BY_ENV: AIProviderName = isProductionLikeClient()
  ? "openai"
  : "ollama";
const IS_SERVER_OPENAI_READY =
  process.env.NEXT_PUBLIC_OPENAI_SERVER_READY === "true";
const REQUIRES_OLLAMA_URL_VERIFICATION = isProductionLikeClient();

const KEYS = {
  selectedProvider: "timeoff-agent:selected-provider",
  openaiApiKeyInput: "timeoff-agent:openai-api-key-input",
  verifiedOpenAIKey: "timeoff-agent:verified-openai-key",
  ollamaBaseUrlInput: "timeoff-agent:ollama-base-url-input",
  verifiedOllamaBaseUrl: "timeoff-agent:verified-ollama-base-url",
} as const;

function deriveProviderStatus({
  selectedProvider,
  verifiedOpenAIKey,
  verifiedOllamaBaseUrl,
  ollamaBaseUrlInput,
  requireOpenAIApiKeyVerification,
}: {
  selectedProvider: AIProviderName;
  verifiedOpenAIKey: string | null;
  verifiedOllamaBaseUrl: string | null;
  ollamaBaseUrlInput: string;
  requireOpenAIApiKeyVerification: boolean;
}): string {
  if (selectedProvider === "openai") {
    if (verifiedOpenAIKey) return PROVIDER_STATUS.openaiVerified;
    if (IS_SERVER_OPENAI_READY && !requireOpenAIApiKeyVerification) {
      return PROVIDER_STATUS.openaiServerDefault;
    }
    return PROVIDER_STATUS.openaiSelected;
  }

  if (verifiedOllamaBaseUrl) return PROVIDER_STATUS.ollamaVerified;
  if (ollamaBaseUrlInput.trim()) {
    return REQUIRES_OLLAMA_URL_VERIFICATION
      ? PROVIDER_STATUS.ollamaSelected
      : PROVIDER_STATUS.ollamaCustomUrl;
  }
  return PROVIDER_STATUS.ollamaDefault;
}

export function useProviderSelection({
  requireOpenAIApiKeyVerification = false,
  defaultProvider = DEFAULT_PROVIDER_BY_ENV,
}: UseProviderSelectionOptions = {}): UseProviderSelectionResult {
  const [selectedProvider, setSelectedProvider] = useState<AIProviderName>(() => {
    const stored = sessionStorage.read(KEYS.selectedProvider);
    return isAIProviderName(stored ?? "") ? (stored as AIProviderName) : defaultProvider;
  });
  const [openaiApiKeyInput, setOpenaiApiKeyInput] = useState(
    () => sessionStorage.read(KEYS.openaiApiKeyInput) ?? "",
  );
  const [ollamaBaseUrlInput, setOllamaBaseUrlInput] = useState(
    () => sessionStorage.read(KEYS.ollamaBaseUrlInput) ?? "",
  );
  const [verifiedOpenAIKey, setVerifiedOpenAIKey] = useState<string | null>(
    () => sessionStorage.read(KEYS.verifiedOpenAIKey),
  );
  const [verifiedOllamaBaseUrl, setVerifiedOllamaBaseUrl] = useState<string | null>(
    () => sessionStorage.read(KEYS.verifiedOllamaBaseUrl),
  );
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [isValidatingOllamaBaseUrl, setIsValidatingOllamaBaseUrl] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isOpenAISelected = selectedProvider === "openai";
  const isOpenAIBypassReady = IS_SERVER_OPENAI_READY && !requireOpenAIApiKeyVerification;
  const isOpenAIReady =
    !isOpenAISelected || isOpenAIBypassReady || Boolean(verifiedOpenAIKey);
  const isOllamaReady = isOpenAISelected
    ? true
    : !REQUIRES_OLLAMA_URL_VERIFICATION || Boolean(verifiedOllamaBaseUrl);
  const isProviderReady = isOpenAISelected ? isOpenAIReady : isOllamaReady;

  const normalizedOllamaBaseUrl = useMemo(
    () => normalizeOllamaBaseUrl(ollamaBaseUrlInput) ?? undefined,
    [ollamaBaseUrlInput],
  );

  // Derived — no useState needed; recalculates on any dependency change.
  // Loading states (verifying…) are captured via the isValidating* flags.
  const providerStatus = useMemo(() => {
    if (selectedProvider === "openai" && isValidatingKey) {
      return PROVIDER_STATUS.verifyingOpenAIKey;
    }
    if (selectedProvider === "ollama" && isValidatingOllamaBaseUrl) {
      return PROVIDER_STATUS.verifyingOllamaUrl;
    }
    return deriveProviderStatus({
      selectedProvider,
      verifiedOpenAIKey,
      verifiedOllamaBaseUrl,
      ollamaBaseUrlInput,
      requireOpenAIApiKeyVerification,
    });
  }, [
    selectedProvider,
    isValidatingKey,
    isValidatingOllamaBaseUrl,
    verifiedOpenAIKey,
    verifiedOllamaBaseUrl,
    ollamaBaseUrlInput,
    requireOpenAIApiKeyVerification,
  ]);

  const requestBody = useMemo<ProviderRequestBody>(
    () =>
      selectedProvider === "openai"
        ? { provider: selectedProvider, openaiApiKey: verifiedOpenAIKey ?? undefined }
        : {
            provider: selectedProvider,
            ollamaBaseUrl: REQUIRES_OLLAMA_URL_VERIFICATION
              ? (verifiedOllamaBaseUrl ?? undefined)
              : normalizedOllamaBaseUrl,
          },
    [normalizedOllamaBaseUrl, selectedProvider, verifiedOllamaBaseUrl, verifiedOpenAIKey],
  );

  useEffect(() => {
    sessionStorage.write(KEYS.selectedProvider, selectedProvider);
  }, [selectedProvider]);

  useEffect(() => {
    sessionStorage.write(
      KEYS.openaiApiKeyInput,
      openaiApiKeyInput.trim() ? openaiApiKeyInput : null,
    );
  }, [openaiApiKeyInput]);

  useEffect(() => {
    sessionStorage.write(KEYS.verifiedOpenAIKey, verifiedOpenAIKey);
  }, [verifiedOpenAIKey]);

  useEffect(() => {
    sessionStorage.write(
      KEYS.ollamaBaseUrlInput,
      ollamaBaseUrlInput.trim() ? ollamaBaseUrlInput : null,
    );
  }, [ollamaBaseUrlInput]);

  useEffect(() => {
    sessionStorage.write(KEYS.verifiedOllamaBaseUrl, verifiedOllamaBaseUrl);
  }, [verifiedOllamaBaseUrl]);

  function selectProvider(nextProvider: AIProviderName) {
    setSelectedProvider(nextProvider);
    setValidationError(null);
  }

  function updateOpenAIApiKeyInput(nextValue: string) {
    setOpenaiApiKeyInput(nextValue);
    setValidationError(null);

    if (verifiedOpenAIKey && verifiedOpenAIKey !== nextValue.trim()) {
      setVerifiedOpenAIKey(null);
    }
  }

  function updateOllamaBaseUrlInput(nextValue: string) {
    setOllamaBaseUrlInput(nextValue);
    setValidationError(null);

    const normalized = normalizeOllamaBaseUrl(nextValue);
    if (verifiedOllamaBaseUrl && verifiedOllamaBaseUrl !== normalized) {
      setVerifiedOllamaBaseUrl(null);
    }
  }

  async function verifyOpenAIKey() {
    const key = openaiApiKeyInput.trim();
    if (!key) return;

    setValidationError(null);
    setIsValidatingKey(true);

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
        return;
      }

      setVerifiedOpenAIKey(null);
      setValidationError(data.details ?? data.message ?? PROVIDER_STATUS.openaiInvalid);
    } catch (error) {
      setVerifiedOpenAIKey(null);
      setValidationError(getErrorMessage(error));
    } finally {
      setIsValidatingKey(false);
    }
  }

  async function verifyOllamaBaseUrl() {
    const baseUrl = normalizeOllamaBaseUrl(ollamaBaseUrlInput);
    if (!baseUrl) return;

    setValidationError(null);
    setIsValidatingOllamaBaseUrl(true);

    try {
      const response = await fetch("/api/validate-ollama-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseUrl }),
      });

      const data = (await response.json()) as ValidateUrlResponse;
      if (!response.ok || !data.ok) {
        throw new Error(data.details ?? data.message ?? PROVIDER_STATUS.ollamaUrlInvalid);
      }

      setVerifiedOllamaBaseUrl(data.normalizedBaseUrl ?? baseUrl);
    } catch (error) {
      setVerifiedOllamaBaseUrl(null);
      setValidationError(getErrorMessage(error));
    } finally {
      setIsValidatingOllamaBaseUrl(false);
    }
  }

  return {
    selectedProvider,
    openaiApiKeyInput,
    ollamaBaseUrlInput,
    providerStatus,
    isOpenAISelected,
    isOpenAIReady,
    isProviderReady,
    isValidatingKey,
    isValidatingOllamaBaseUrl,
    validationError,
    requestBody,
    selectProvider,
    updateOpenAIApiKeyInput,
    updateOllamaBaseUrlInput,
    verifyOpenAIKey,
    verifyOllamaBaseUrl,
  };
}
