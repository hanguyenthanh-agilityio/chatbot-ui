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

  const content = (
    <div className="flex flex-col gap-3">
      <div className="space-y-1">
        <Text as="label" variant="body" className="font-medium text-slate-900">
          Provider
        </Text>
        <Text variant="caption" className="text-slate-500">
          Keep the chat app slim, but switch models whenever you need.
        </Text>
      </div>

      <Select
        value={selectedProvider}
        onChange={(event) =>
          onProviderChange(event.target.value as AIProviderName)
        }
        disabled={isProviderSelectDisabled}
        fullWidth
        controlSize="md"
      >
        {allowedProviders.includes("ollama") ? (
          <option value="ollama">Ollama</option>
        ) : null}
        {allowedProviders.includes("openai") ? (
          <option value="openai">OpenAI</option>
        ) : null}
      </Select>

      <Text variant="caption" className="min-h-4 text-slate-600" aria-live="polite">
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
          />
          <Button
            type="button"
            onClick={onVerifyOpenAIKey}
            isLoading={isValidatingKey}
            variant="primary"
            size="md"
            fullWidth
          >
            {isValidatingKey ? "Verifying..." : "Verify OpenAI key"}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <Input
            type="url"
            value={ollamaBaseUrlInput}
            onChange={(event) => onOllamaBaseUrlChange(event.target.value)}
            placeholder="Ollama base URL (optional locally, e.g. http://localhost:11434)"
            fullWidth
            controlSize="md"
          />
          <Button
            type="button"
            onClick={onVerifyOllamaBaseUrl}
            isLoading={isValidatingOllamaBaseUrl}
            variant="outline"
            size="md"
            fullWidth
          >
            {isValidatingOllamaBaseUrl ? "Verifying..." : "Verify Ollama URL"}
          </Button>
          <Text variant="caption" className="text-slate-500">
            {isProductionLikeClient()
              ? "A verified public Ollama URL is required in production-like mode."
              : "If left empty in local development, the app uses the default Ollama config from env."}
          </Text>
        </div>
      )}
    </div>
  );

  if (!withContainer) return content;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {content}
    </section>
  );
}
