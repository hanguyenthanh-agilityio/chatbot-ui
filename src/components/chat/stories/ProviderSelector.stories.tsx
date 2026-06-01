import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { ProviderSelector } from "@/components/chat/provider-selector";
import { mockProvider } from "@/mocks/provider-selector";
import { PROVIDER_STATUS_COPY } from "@/constants/provider";

const meta = {
  title: "Chat/ProviderSelector",
  component: ProviderSelector,
} satisfies Meta<typeof ProviderSelector>;

export default meta;

type Story = StoryObj<typeof ProviderSelector>;

/** OpenAI branch; `fn()` handlers appear in the Actions panel. */
export const OpenAI: Story = {
  args: {
    withContainer: true,
    provider: mockProvider({
      selectProvider: fn(),
      updateOpenAIApiKeyInput: fn(),
      updateOllamaBaseUrlInput: fn(),
      verifyOpenAIKey: fn(),
      verifyOllamaBaseUrl: fn(),
      dismissSuccessMessage: fn(),
    }),
  },
};

export const Ollama: Story = {
  args: {
    provider: mockProvider({
      selectedProvider: "ollama",
      isOpenAISelected: false,
      providerStatus: PROVIDER_STATUS_COPY.ollamaDefault,
      requestBody: { provider: "ollama" },
    }),
  },
};

export const WithoutCard: Story = {
  args: {
    withContainer: false,
    provider: mockProvider(),
  },
};

export const SingleProvider: Story = {
  args: {
    allowedProviders: ["openai"],
    provider: mockProvider(),
  },
};
