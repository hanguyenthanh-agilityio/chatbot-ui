import { PROVIDER_STATUS_COPY } from "@/constants/provider";
import type { UseProviderSelectionResult } from "@/types/provider";

const noop = () => {};
const noopAsync = async () => {};

export function mockProvider(
  overrides: Partial<UseProviderSelectionResult> = {},
): UseProviderSelectionResult {
  return {
    selectedProvider: "openai",
    openaiApiKeyInput: "",
    ollamaBaseUrlInput: "",
    providerStatus: PROVIDER_STATUS_COPY.openaiSelected,
    isOpenAISelected: true,
    isOpenAIReady: false,
    isOpenAIKeyVerified: false,
    isOllamaUrlVerified: false,
    isProviderReady: false,
    isValidatingKey: false,
    isValidatingOllamaBaseUrl: false,
    validationError: null,
    successMessage: null,
    dismissSuccessMessage: noop,
    requestBody: { provider: "openai" },
    selectProvider: noop,
    updateOpenAIApiKeyInput: noop,
    updateOllamaBaseUrlInput: noop,
    verifyOpenAIKey: noopAsync,
    verifyOllamaBaseUrl: noopAsync,
    ...overrides,
  };
}
