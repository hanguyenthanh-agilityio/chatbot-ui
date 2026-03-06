import type { AIProviderName } from "@/lib/ai-provider";
import { isProductionLikeClient } from "@/lib/runtime-env";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Text } from "@/components/ui/text";

type ProviderSelectorProps = {
  selectedProvider: AIProviderName;
  allowedProviders?: AIProviderName[];
  openaiApiKeyInput: string;
  ollamaBaseUrlInput: string;
  isOpenAISelected: boolean;
  isValidatingKey: boolean;
  isValidatingOllamaBaseUrl: boolean;
  providerStatus: string;
  withContainer?: boolean;
  onProviderChange: (provider: AIProviderName) => void;
  onOpenAIApiKeyChange: (value: string) => void;
  onOllamaBaseUrlChange: (value: string) => void;
  onVerifyOpenAIKey: () => void | Promise<void>;
  onVerifyOllamaBaseUrl: () => void | Promise<void>;
};

export function ProviderSelector({
  selectedProvider,
  allowedProviders = ["ollama", "openai"],
  openaiApiKeyInput,
  ollamaBaseUrlInput,
  isOpenAISelected,
  isValidatingKey,
  isValidatingOllamaBaseUrl,
  providerStatus,
  withContainer = true,
  onProviderChange,
  onOpenAIApiKeyChange,
  onOllamaBaseUrlChange,
  onVerifyOpenAIKey,
  onVerifyOllamaBaseUrl,
}: ProviderSelectorProps) {
  const isProviderSelectDisabled = allowedProviders.length <= 1;
  const showOllamaBaseUrlInput = isProductionLikeClient() && !isOpenAISelected;

  const content = (
    <div className="flex flex-col gap-2">
      <Text as="label" variant="body" className="font-medium text-slate-800">
        AI Provider
      </Text>

      <Select
        value={selectedProvider}
        onChange={(event) =>
          onProviderChange(event.target.value as AIProviderName)
        }
        disabled={isProviderSelectDisabled}
        fullWidth
        controlSize="md"
        variant="default"
      >
        {allowedProviders.includes("ollama") ? (
          <option value="ollama">Ollama</option>
        ) : null}
        {allowedProviders.includes("openai") ? (
          <option value="openai">OpenAI</option>
        ) : null}
      </Select>

      <Text variant="caption" className="min-h-4" aria-live="polite">
        {providerStatus}
      </Text>

      {isOpenAISelected ? (
        <div className="flex flex-col gap-2">
          <Input
            type="password"
            value={openaiApiKeyInput}
            onChange={(event) => onOpenAIApiKeyChange(event.target.value)}
            placeholder="Enter OpenAI API key (sk-...)"
            fullWidth
            controlSize="md"
            variant="default"
          />
          <Button
            type="button"
            onClick={onVerifyOpenAIKey}
            isLoading={isValidatingKey}
            variant="primary"
            size="md"
            fullWidth
          >
            {isValidatingKey ? "Verifying..." : "Verify key"}
          </Button>
        </div>
      ) : null}

      {showOllamaBaseUrlInput ? (
        <div className="flex flex-col gap-2">
          <Input
            type="url"
            value={ollamaBaseUrlInput}
            onChange={(event) => onOllamaBaseUrlChange(event.target.value)}
            placeholder="Ollama base URL (e.g. https://your-tunnel.example.com/v1)"
            fullWidth
            controlSize="md"
            variant="default"
          />

          <Button
            type="button"
            onClick={onVerifyOllamaBaseUrl}
            isLoading={isValidatingOllamaBaseUrl}
            variant="primary"
            size="md"
          >
            {isValidatingOllamaBaseUrl ? "Verifying..." : "Verify URL"}
          </Button>
        </div>
      ) : null}
    </div>
  );

  if (!withContainer) return content;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {content}
    </section>
  );
}
