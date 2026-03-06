import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";
import { isProductionLikeServer } from "@/lib/runtime-env";

export const SUPPORTED_AI_PROVIDERS = ["openai", "ollama"] as const;

export type AIProviderName = (typeof SUPPORTED_AI_PROVIDERS)[number];

export type ChatModelConfig = {
  provider: AIProviderName;
  modelId: string;
  model: LanguageModel;
};

export type ChatModelOverrides = {
  provider?: AIProviderName;
  openaiApiKey?: string;
  modelId?: string;
  baseUrl?: string;
};

export function isAIProviderName(value: string): value is AIProviderName {
  return SUPPORTED_AI_PROVIDERS.includes(value as AIProviderName);
}

export function getSupportedAIProviderList(): string {
  return SUPPORTED_AI_PROVIDERS.join(", ");
}

abstract class ProviderResolver {
  constructor(
    readonly provider: AIProviderName,
    protected readonly overrides: ChatModelOverrides,
  ) {}

  protected resolveModelFromEnv(): string | undefined {
    return (
      this.overrides.modelId ?? process.env.AI_MODEL ?? process.env.OPENAI_MODEL
    );
  }

  protected abstract getDefaultModelId(): string;
  protected abstract createModel(modelId: string): LanguageModel;

  getConfig(): ChatModelConfig {
    const modelId = this.resolveModelFromEnv() ?? this.getDefaultModelId();

    return {
      provider: this.provider,
      modelId,
      model: this.createModel(modelId),
    };
  }
}

class OpenAIResolver extends ProviderResolver {
  constructor(overrides: ChatModelOverrides) {
    super("openai", overrides);
  }

  protected getDefaultModelId(): string {
    return "gpt-4o-mini";
  }

  protected createModel(modelId: string): LanguageModel {
    const apiKey = this.resolveOpenAIApiKey();
    const openai = createOpenAI({
      baseURL: this.overrides.baseUrl ?? process.env.OPENAI_BASE_URL,
      apiKey,
    });

    return openai.chat(modelId);
  }

  private resolveOpenAIApiKey(): string {
    const keyFromOverride = this.overrides.openaiApiKey?.trim();
    if (keyFromOverride) return keyFromOverride;

    const keyFromEnv = process.env.OPENAI_API_KEY?.trim();
    if (keyFromEnv) return keyFromEnv;

    throw new Error("OpenAI API key is required.");
  }
}

class OllamaResolver extends ProviderResolver {
  constructor(overrides: ChatModelOverrides) {
    super("ollama", overrides);
  }

  protected getDefaultModelId(): string {
    return "qwen2.5:3b";
  }

  protected createModel(modelId: string): LanguageModel {
    const openaiCompatible = createOpenAI({
      baseURL:
        this.overrides.baseUrl ??
        process.env.OPENAI_BASE_URL ??
        "http://localhost:11434/v1",
      apiKey: process.env.OPENAI_API_KEY ?? "ollama",
    });

    // Ollama OpenAI-compatible endpoint works best with chat mode.
    return openaiCompatible.chat(modelId);
  }
}

function resolveDefaultProvider(): AIProviderName {
  return isProductionLikeServer() ? "openai" : "ollama";
}

function resolveProvider(overrides: ChatModelOverrides): AIProviderName {
  if (overrides.provider) {
    return overrides.provider;
  }

  const provider = process.env.AI_PROVIDER?.trim().toLowerCase();

  if (!provider) {
    return resolveDefaultProvider();
  }

  if (isAIProviderName(provider)) {
    return provider;
  }

  throw new Error(
    `Unsupported AI_PROVIDER "${provider}". Supported values: ${getSupportedAIProviderList()}.`,
  );
}

function getResolver(
  provider: AIProviderName,
  overrides: ChatModelOverrides,
): ProviderResolver {
  switch (provider) {
    case "openai":
      return new OpenAIResolver(overrides);
    case "ollama":
      return new OllamaResolver(overrides);
  }
}

export function getChatModelConfig(
  overrides: ChatModelOverrides = {},
): ChatModelConfig {
  const provider = resolveProvider(overrides);
  const resolver = getResolver(provider, overrides);
  return resolver.getConfig();
}
