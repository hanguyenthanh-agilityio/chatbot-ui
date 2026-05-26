import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

// Types
import type { AIProviderName } from "@/lib/ai-provider";

// Components
import { ProviderSelector } from "@/components/chat/provider-selector";

// Constants
import { PROVIDER_PANEL_COPY } from "@/constants/provider";

// Mocks
import { mockProvider } from "@/mocks/provider-selector";
import type { UseProviderSelectionResult } from "@/types/provider";

vi.mock("@/lib/runtime-env", () => ({
  isProductionLike: vi.fn(() => false),
}));

import { isProductionLike } from "@/lib/runtime-env";

const productionLike = vi.mocked(isProductionLike);

function renderPanel(
  provider: Partial<UseProviderSelectionResult> = {},
  {
    allowedProviders,
    withContainer = false,
  }: {
    allowedProviders?: AIProviderName[];
    withContainer?: boolean;
  } = {},
) {
  return render(
    <ProviderSelector
      provider={mockProvider(provider)}
      allowedProviders={allowedProviders}
      withContainer={withContainer}
    />,
  );
}

describe("ProviderSelector", () => {
  afterEach(() => {
    cleanup();
    productionLike.mockReturnValue(false);
  });

  it.each([
    {
      id: "openai",
      provider: { isOpenAISelected: true, selectedProvider: "openai" as const },
    },
    {
      id: "ollama",
      provider: {
        isOpenAISelected: false,
        selectedProvider: "ollama" as const,
      },
    },
    {
      id: "openai-validating",
      provider: { isOpenAISelected: true, isValidatingKey: true },
    },
    {
      id: "ollama-validating",
      provider: {
        isOpenAISelected: false,
        selectedProvider: "ollama" as const,
        isValidatingOllamaBaseUrl: true,
      },
    },
    {
      id: "openai-only",
      provider: { isOpenAISelected: true, selectedProvider: "openai" as const },
      allowedProviders: ["openai"] satisfies AIProviderName[],
    },
    {
      id: "ollama-only",
      provider: {
        isOpenAISelected: false,
        selectedProvider: "ollama" as const,
      },
      allowedProviders: ["ollama"] satisfies AIProviderName[],
    },
    { id: "with-card", withContainer: true },
    {
      id: "ollama-production",
      provider: {
        isOpenAISelected: false,
        selectedProvider: "ollama" as const,
      },
      production: true,
    },
  ])(
    "snapshot $id",
    ({ id, provider = {}, allowedProviders, withContainer, production }) => {
      if (production) productionLike.mockReturnValue(true);
      const { container } = renderPanel(provider, {
        allowedProviders,
        withContainer,
      });
      expect(container.firstElementChild?.outerHTML ?? "").toMatchSnapshot(id);
    },
  );

  it.each([
    {
      handler: "updateOpenAIApiKeyInput",
      provider: { isOpenAISelected: true },
      run: async (user: ReturnType<typeof userEvent.setup>) => {
        await user.type(
          screen.getByPlaceholderText(
            PROVIDER_PANEL_COPY.openaiApiKeyPlaceholder,
          ),
          "sk-test",
        );
      },
    },
    {
      handler: "updateOllamaBaseUrlInput",
      provider: {
        isOpenAISelected: false,
        selectedProvider: "ollama" as const,
      },
      run: async (user: ReturnType<typeof userEvent.setup>) => {
        await user.type(
          screen.getByPlaceholderText(
            PROVIDER_PANEL_COPY.ollamaBaseUrlPlaceholder,
          ),
          "http://localhost:11434",
        );
      },
    },
    {
      handler: "verifyOpenAIKey",
      provider: { isOpenAISelected: true },
      run: async (user: ReturnType<typeof userEvent.setup>) => {
        await user.click(
          screen.getByRole("button", {
            name: PROVIDER_PANEL_COPY.verifyOpenAIButtonLabel,
          }),
        );
      },
    },
    {
      handler: "verifyOllamaBaseUrl",
      provider: {
        isOpenAISelected: false,
        selectedProvider: "ollama" as const,
      },
      run: async (user: ReturnType<typeof userEvent.setup>) => {
        await user.click(
          screen.getByRole("button", {
            name: PROVIDER_PANEL_COPY.verifyOllamaButtonLabel,
          }),
        );
      },
    },
    {
      handler: "selectProvider",
      provider: {},
      run: async (user: ReturnType<typeof userEvent.setup>) => {
        await user.selectOptions(screen.getByRole("combobox"), "ollama");
      },
      assert: (fn: ReturnType<typeof vi.fn>) =>
        expect(fn).toHaveBeenCalledWith("ollama"),
    },
  ])("calls $handler", async ({ handler, provider, run, assert }) => {
    const user = userEvent.setup();
    const fn = vi.fn().mockResolvedValue(undefined);
    renderPanel({ ...provider, [handler]: fn });
    await run(user);
    if (assert) assert(fn);
    else expect(fn).toHaveBeenCalled();
  });
});
