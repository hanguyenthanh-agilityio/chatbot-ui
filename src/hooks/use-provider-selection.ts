"use client";

import { useEffect, useMemo, useState } from "react";
import { PROVIDER_STATUS } from "@/constants/chat-ui";
import { isAIProviderName, type AIProviderName } from "@/lib/ai-provider";
import { normalizeMcpServerUrl } from "@/lib/mcp-url";
import { normalizeOllamaBaseUrl } from "@/lib/ollama-url";
import { isProductionLikeClient } from "@/lib/runtime-env";
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
  normalizedServerUrl?: string;
  normalizedBaseUrl?: string;
};

type ProviderRequestBody = {
  provider: AIProviderName;
  openaiApiKey?: string;
  ollamaBaseUrl?: string;
  mcpServerUrl?: string;
};

type UseProviderSelectionOptions = {
  requireMcpServerUrl?: boolean;
  requireOpenAIApiKeyVerification?: boolean;
  defaultProvider?: AIProviderName;
};

type UseProviderSelectionResult = {
  selectedProvider: AIProviderName;
  openaiApiKeyInput: string;
  ollamaBaseUrlInput: string;
  mcpServerUrlInput: string;
  providerStatus: string;
  isOpenAISelected: boolean;
  isOpenAIReady: boolean;
  isProviderReady: boolean;
  isValidatingKey: boolean;
  isValidatingOllamaBaseUrl: boolean;
  isValidatingMcpServerUrl: boolean;
  validationError: string | null;
  validationErrorId: number;
  openaiApiKeyForRequests?: string;
  requestBody: ProviderRequestBody;
  selectProvider: (provider: AIProviderName) => void;
  updateOpenAIApiKeyInput: (value: string) => void;
  updateOllamaBaseUrlInput: (value: string) => void;
  updateMcpServerUrlInput: (value: string) => void;
  verifyOpenAIKey: () => Promise<void>;
  verifyOllamaBaseUrl: () => Promise<void>;
  verifyMcpServerUrl: () => Promise<void>;
};

const DEFAULT_PROVIDER_BY_ENV: AIProviderName = isProductionLikeClient()
  ? "openai"
  : "ollama";
const IS_SERVER_OPENAI_READY =
  process.env.NEXT_PUBLIC_OPENAI_SERVER_READY === "true";
const REQUIRES_OLLAMA_URL_VERIFICATION = isProductionLikeClient();
const SESSION_STORAGE_KEYS = {
  selectedProvider: "ai-sdk:selected-provider",
  openaiApiKeyInput: "ai-sdk:openai-api-key-input",
  verifiedOpenAIKey: "ai-sdk:verified-openai-key",
} as const;

function readSessionStorage(key: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeSessionStorage(key: string, value: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (value) {
      window.sessionStorage.setItem(key, value);
      return;
    }

    window.sessionStorage.removeItem(key);
  } catch {
    // Ignore storage failures and keep in-memory state working.
  }
}

export function useProviderSelection({
  requireMcpServerUrl = false,
  requireOpenAIApiKeyVerification = false,
  defaultProvider = DEFAULT_PROVIDER_BY_ENV,
}: UseProviderSelectionOptions = {}): UseProviderSelectionResult {
  const storedSelectedProvider = readSessionStorage(
    SESSION_STORAGE_KEYS.selectedProvider,
  );
  const initialSelectedProvider: AIProviderName = isAIProviderName(
    storedSelectedProvider ?? "",
  )
    ? (storedSelectedProvider as AIProviderName)
    : defaultProvider;
  const initialOpenAIKeyInput =
    readSessionStorage(SESSION_STORAGE_KEYS.openaiApiKeyInput) ?? "";
  const initialVerifiedOpenAIKey =
    readSessionStorage(SESSION_STORAGE_KEYS.verifiedOpenAIKey);
  const [selectedProvider, setSelectedProvider] =
    useState<AIProviderName>(initialSelectedProvider);
  const [openaiApiKeyInput, setOpenaiApiKeyInput] =
    useState(initialOpenAIKeyInput);
  const [ollamaBaseUrlInput, setOllamaBaseUrlInput] = useState("");
  const [mcpServerUrlInput, setMcpServerUrlInput] = useState("");
  const [verifiedOpenAIKey, setVerifiedOpenAIKey] = useState<string | null>(
    initialVerifiedOpenAIKey,
  );
  const [verifiedOllamaBaseUrl, setVerifiedOllamaBaseUrl] = useState<
    string | null
  >(null);
  const [verifiedMcpServerUrl, setVerifiedMcpServerUrl] = useState<
    string | null
  >(null);
  const [providerStatus, setProviderStatus] = useState<string>(
    initialSelectedProvider === "openai" &&
      initialVerifiedOpenAIKey
      ? PROVIDER_STATUS.openaiVerified
      : initialSelectedProvider === "openai" &&
          IS_SERVER_OPENAI_READY &&
          !requireOpenAIApiKeyVerification
      ? PROVIDER_STATUS.openaiServerDefault
      : initialSelectedProvider === "openai"
        ? PROVIDER_STATUS.openaiSelected
        : REQUIRES_OLLAMA_URL_VERIFICATION
          ? PROVIDER_STATUS.ollamaSelected
          : PROVIDER_STATUS.ollamaDefault,
  );
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [isValidatingOllamaBaseUrl, setIsValidatingOllamaBaseUrl] =
    useState(false);
  const [isValidatingMcpServerUrl, setIsValidatingMcpServerUrl] =
    useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationErrorId, setValidationErrorId] = useState(0);

  function setNewValidationError(message: string) {
    setValidationError(message);
    setValidationErrorId((value) => value + 1);
  }

  const isOpenAISelected = selectedProvider === "openai";
  const isOpenAIBypassReady =
    IS_SERVER_OPENAI_READY && !requireOpenAIApiKeyVerification;
  const isOpenAIReady =
    !isOpenAISelected || isOpenAIBypassReady || Boolean(verifiedOpenAIKey);
  const isOllamaReady = isOpenAISelected
    ? true
    : !REQUIRES_OLLAMA_URL_VERIFICATION
      ? true
      : Boolean(verifiedOllamaBaseUrl) &&
        (!requireMcpServerUrl || Boolean(verifiedMcpServerUrl));
  const isProviderReady = isOpenAISelected ? isOpenAIReady : isOllamaReady;

  const requestBody = useMemo<ProviderRequestBody>(
    () =>
      selectedProvider === "openai"
        ? {
            provider: selectedProvider,
            openaiApiKey: verifiedOpenAIKey ?? undefined,
          }
        : {
            provider: selectedProvider,
            ollamaBaseUrl: REQUIRES_OLLAMA_URL_VERIFICATION
              ? (verifiedOllamaBaseUrl ?? undefined)
              : (normalizeOllamaBaseUrl(ollamaBaseUrlInput) ??
                  ollamaBaseUrlInput.trim()) ||
                undefined,
            mcpServerUrl: REQUIRES_OLLAMA_URL_VERIFICATION
              ? (verifiedMcpServerUrl ?? undefined)
              : (normalizeMcpServerUrl(mcpServerUrlInput) ??
                  mcpServerUrlInput.trim()) ||
                undefined,
          },
    [
      selectedProvider,
      verifiedOpenAIKey,
      verifiedOllamaBaseUrl,
      verifiedMcpServerUrl,
      ollamaBaseUrlInput,
      mcpServerUrlInput,
    ],
  );

  useEffect(() => {
    writeSessionStorage(SESSION_STORAGE_KEYS.selectedProvider, selectedProvider);
  }, [selectedProvider]);

  useEffect(() => {
    writeSessionStorage(
      SESSION_STORAGE_KEYS.openaiApiKeyInput,
      openaiApiKeyInput.trim() ? openaiApiKeyInput : null,
    );
  }, [openaiApiKeyInput]);

  useEffect(() => {
    writeSessionStorage(
      SESSION_STORAGE_KEYS.verifiedOpenAIKey,
      verifiedOpenAIKey,
    );
  }, [verifiedOpenAIKey]);

  function selectProvider(nextProvider: AIProviderName) {
    setSelectedProvider(nextProvider);
    setValidationError(null);

    if (nextProvider === "ollama") {
      setProviderStatus(
        REQUIRES_OLLAMA_URL_VERIFICATION
          ? PROVIDER_STATUS.ollamaSelected
          : PROVIDER_STATUS.ollamaDefault,
      );
      return;
    }

    setVerifiedOpenAIKey(null);
    setVerifiedOllamaBaseUrl(null);
    setVerifiedMcpServerUrl(null);
    setProviderStatus(
      isOpenAIBypassReady
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
          isOpenAIBypassReady
            ? PROVIDER_STATUS.openaiServerDefault
            : PROVIDER_STATUS.openaiSelected,
        );
      }
    }
  }

  function updateOllamaBaseUrlInput(nextValue: string) {
    setOllamaBaseUrlInput(nextValue);
    setValidationError(null);

    const normalizedNextValue = normalizeOllamaBaseUrl(nextValue);
    if (
      verifiedOllamaBaseUrl &&
      verifiedOllamaBaseUrl !== normalizedNextValue
    ) {
      setVerifiedOllamaBaseUrl(null);
    }

    if (REQUIRES_OLLAMA_URL_VERIFICATION && selectedProvider === "ollama") {
      setProviderStatus(PROVIDER_STATUS.ollamaSelected);
    }
  }

  function updateMcpServerUrlInput(nextValue: string) {
    setMcpServerUrlInput(nextValue);
    setValidationError(null);

    const normalizedNextValue = normalizeMcpServerUrl(nextValue);
    if (verifiedMcpServerUrl && verifiedMcpServerUrl !== normalizedNextValue) {
      setVerifiedMcpServerUrl(null);
    }

    if (REQUIRES_OLLAMA_URL_VERIFICATION && selectedProvider === "ollama") {
      setProviderStatus(PROVIDER_STATUS.ollamaSelected);
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

  async function verifyOllamaBaseUrl() {
    const baseUrl = normalizeOllamaBaseUrl(ollamaBaseUrlInput);

    if (!baseUrl) {
      setProviderStatus(PROVIDER_STATUS.ollamaBaseUrlRequired);
      return;
    }

    setValidationError(null);
    setIsValidatingOllamaBaseUrl(true);
    setProviderStatus(PROVIDER_STATUS.verifyingOllamaUrls);

    try {
      const ollamaResponse = await fetch("/api/validate-ollama-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseUrl }),
      });

      const ollamaData = (await ollamaResponse.json()) as ValidateUrlResponse;
      if (!ollamaResponse.ok || !ollamaData.ok) {
        throw new Error(
          ollamaData.details ??
            ollamaData.message ??
            PROVIDER_STATUS.ollamaUrlInvalid,
        );
      }

      setVerifiedOllamaBaseUrl(ollamaData.normalizedBaseUrl ?? baseUrl);
      setProviderStatus(PROVIDER_STATUS.ollamaUrlsVerified);
    } catch (error) {
      setVerifiedOllamaBaseUrl(null);
      setProviderStatus(PROVIDER_STATUS.ollamaUrlInvalid);
      setNewValidationError(getErrorMessage(error));
    } finally {
      setIsValidatingOllamaBaseUrl(false);
    }
  }

  async function verifyMcpServerUrl() {
    const mcpUrl = normalizeMcpServerUrl(mcpServerUrlInput);

    if (!mcpUrl) {
      setProviderStatus(PROVIDER_STATUS.ollamaMcpUrlRequired);
      return;
    }

    setValidationError(null);
    setIsValidatingMcpServerUrl(true);
    setProviderStatus(PROVIDER_STATUS.verifyingMcpServerUrl);

    try {
      const mcpResponse = await fetch("/api/validate-mcp-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serverUrl: mcpUrl }),
      });

      const mcpData = (await mcpResponse.json()) as ValidateUrlResponse;
      if (!mcpResponse.ok || !mcpData.ok) {
        throw new Error(
          mcpData.details ??
            mcpData.message ??
            PROVIDER_STATUS.ollamaUrlInvalid,
        );
      }

      setVerifiedMcpServerUrl(mcpData.normalizedServerUrl ?? mcpUrl);
      setProviderStatus(PROVIDER_STATUS.ollamaMcpUrlsVerified);
    } catch (error) {
      setVerifiedMcpServerUrl(null);
      setProviderStatus(PROVIDER_STATUS.ollamaUrlInvalid);
      setNewValidationError(getErrorMessage(error));
    } finally {
      setIsValidatingMcpServerUrl(false);
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
    isProviderReady,
    isValidatingKey,
    isValidatingOllamaBaseUrl,
    isValidatingMcpServerUrl,
    validationError,
    validationErrorId,
    openaiApiKeyForRequests: verifiedOpenAIKey ?? undefined,
    requestBody,
    selectProvider,
    updateOpenAIApiKeyInput,
    updateOllamaBaseUrlInput,
    updateMcpServerUrlInput,
    verifyOpenAIKey,
    verifyOllamaBaseUrl,
    verifyMcpServerUrl,
  };
}
