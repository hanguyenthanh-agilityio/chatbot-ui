import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { API_ROUTE_PATH } from "@/constants/api";
import { PROVIDER_STATUS_COPY } from "@/constants/provider";
import { PROVIDER_STORAGE_KEYS } from "@/constants/storage";
import { useProviderSelection } from "@/hooks/use-provider";
import { session } from "@/utils/storage";

vi.mock("@/lib/runtime-env", () => ({
  isProductionLike: vi.fn(() => false),
}));

function jsonResponse(body: unknown, ok = true) {
  return {
    ok,
    json: async () => body,
  };
}

describe("useProviderSelection", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    sessionStorage.clear();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  it("restores session state and persists provider changes", () => {
    session.write(PROVIDER_STORAGE_KEYS.selectedProvider, "openai");
    session.write(PROVIDER_STORAGE_KEYS.verifiedOpenAIKey, "sk-stored");

    const { result } = renderHook(() =>
      useProviderSelection({ defaultProvider: "ollama" }),
    );

    expect(result.current.selectedProvider).toBe("openai");
    expect(result.current.isOpenAIKeyVerified).toBe(true);
    expect(result.current.providerStatus).toBe(
      PROVIDER_STATUS_COPY.openaiVerified,
    );

    act(() => {
      result.current.selectProvider("ollama");
    });

    expect(result.current.selectedProvider).toBe("ollama");
    expect(result.current.isOpenAISelected).toBe(false);
    expect(session.read(PROVIDER_STORAGE_KEYS.selectedProvider)).toBe("ollama");
  });

  it("falls back to defaultProvider when stored provider is invalid", () => {
    session.write(PROVIDER_STORAGE_KEYS.selectedProvider, "invalid-provider");

    const { result } = renderHook(() =>
      useProviderSelection({ defaultProvider: "openai" }),
    );

    expect(result.current.selectedProvider).toBe("openai");
  });

  it("clears verified credentials when inputs change", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ ok: true }))
      .mockResolvedValueOnce(
        jsonResponse({
          ok: true,
          normalizedBaseUrl: "http://localhost:11434/v1",
        }),
      );

    const { result } = renderHook(() => useProviderSelection());

    act(() => {
      result.current.updateOpenAIApiKeyInput("sk-test");
    });
    await act(async () => {
      await result.current.verifyOpenAIKey();
    });
    expect(result.current.isOpenAIKeyVerified).toBe(true);

    act(() => {
      result.current.updateOpenAIApiKeyInput("sk-changed");
    });
    expect(result.current.isOpenAIKeyVerified).toBe(false);

    act(() => {
      result.current.selectProvider("ollama");
      result.current.updateOllamaBaseUrlInput("http://localhost:11434");
    });
    await act(async () => {
      await result.current.verifyOllamaBaseUrl();
    });
    expect(result.current.isOllamaUrlVerified).toBe(true);

    act(() => {
      result.current.updateOllamaBaseUrlInput("http://127.0.0.1:11434");
    });
    expect(result.current.isOllamaUrlVerified).toBe(false);
  });

  it("verifyOpenAIKey requires input, verifies success, and surfaces failures", async () => {
    const { result } = renderHook(() => useProviderSelection());

    await act(async () => {
      await result.current.verifyOpenAIKey();
    });
    expect(result.current.validationError).toBe(
      PROVIDER_STATUS_COPY.openaiKeyRequired,
    );

    fetchMock
      .mockResolvedValueOnce(jsonResponse({ ok: true }))
      .mockResolvedValueOnce(
        jsonResponse({ ok: false, message: "Invalid key" }, false),
      )
      .mockRejectedValueOnce(new Error("offline"));

    act(() => {
      result.current.updateOpenAIApiKeyInput("sk-good");
    });
    await act(async () => {
      await result.current.verifyOpenAIKey();
    });

    expect(fetchMock).toHaveBeenCalledWith(API_ROUTE_PATH.validateOpenAIKey, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey: "sk-good" }),
    });
    expect(result.current.isOpenAIKeyVerified).toBe(true);
    expect(result.current.isProviderReady).toBe(true);
    expect(result.current.requestBody).toEqual({
      provider: "openai",
      openaiApiKey: "sk-good",
    });
    expect(result.current.successMessage).toBe(
      "OpenAI API key verified successfully.",
    );

    act(() => {
      result.current.dismissSuccessMessage();
    });
    expect(result.current.successMessage).toBeNull();

    act(() => {
      result.current.updateOpenAIApiKeyInput("sk-bad");
    });
    await act(async () => {
      await result.current.verifyOpenAIKey();
    });
    expect(result.current.validationError).toBe("Invalid key");

    act(() => {
      result.current.updateOpenAIApiKeyInput("sk-offline");
    });
    await act(async () => {
      await result.current.verifyOpenAIKey();
    });
    expect(result.current.validationError).toBe("offline");
  });

  it("verifyOllamaBaseUrl requires input, verifies success, and surfaces failures", async () => {
    const { result } = renderHook(() => useProviderSelection());

    act(() => {
      result.current.selectProvider("ollama");
    });

    await act(async () => {
      await result.current.verifyOllamaBaseUrl();
    });
    expect(result.current.validationError).toBe(
      PROVIDER_STATUS_COPY.ollamaBaseUrlRequired,
    );

    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({
          ok: true,
          normalizedBaseUrl: "http://localhost:11434/v1",
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({ ok: false, message: "Cannot reach Ollama" }, false),
      );

    act(() => {
      result.current.updateOllamaBaseUrlInput("http://localhost:11434");
    });
    expect(result.current.providerStatus).toBe(
      PROVIDER_STATUS_COPY.ollamaCustomUrl,
    );

    await act(async () => {
      await result.current.verifyOllamaBaseUrl();
    });

    expect(fetchMock).toHaveBeenCalledWith(API_ROUTE_PATH.validateOllamaUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ baseUrl: "http://localhost:11434/v1" }),
    });
    expect(result.current.isOllamaUrlVerified).toBe(true);
    expect(result.current.isProviderReady).toBe(true);
    expect(result.current.requestBody).toEqual({
      provider: "ollama",
      ollamaBaseUrl: "http://localhost:11434/v1",
    });
    expect(result.current.successMessage).toBe(
      "Ollama URL verified successfully.",
    );

    act(() => {
      result.current.updateOllamaBaseUrlInput("http://127.0.0.1:11434");
    });
    await act(async () => {
      await result.current.verifyOllamaBaseUrl();
    });
    expect(result.current.validationError).toBe("Cannot reach Ollama");
  });

  it("clears validation errors when switching providers", async () => {
    const { result } = renderHook(() => useProviderSelection());

    await act(async () => {
      await result.current.verifyOpenAIKey();
    });
    expect(result.current.validationError).toBeTruthy();

    act(() => {
      result.current.selectProvider("ollama");
    });

    expect(result.current.validationError).toBeNull();
    expect(result.current.providerStatus).toBe(
      PROVIDER_STATUS_COPY.ollamaDefault,
    );

    act(() => {
      result.current.selectProvider("openai");
    });

    expect(result.current.validationError).toBeNull();
  });

  it("shows verifying status while OpenAI validation is pending", async () => {
    let resolveFetch!: (value: unknown) => void;
    fetchMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        }),
    );

    const { result } = renderHook(() =>
      useProviderSelection({ requireOpenAIApiKeyVerification: true }),
    );

    act(() => {
      result.current.selectProvider("openai");
      result.current.updateOpenAIApiKeyInput("sk-test");
    });

    let verifyPromise!: Promise<void>;
    act(() => {
      verifyPromise = result.current.verifyOpenAIKey();
    });

    expect(result.current.isValidatingKey).toBe(true);
    expect(result.current.providerStatus).toBe(
      PROVIDER_STATUS_COPY.verifyingOpenAIKey,
    );

    await act(async () => {
      resolveFetch(jsonResponse({ ok: true }));
      await verifyPromise;
    });

    expect(result.current.isValidatingKey).toBe(false);
  });
});
