import type { AIProviderName } from "@/lib/ai-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Text } from "@/components/ui/text";

type ProviderSelectorProps = {
  selectedProvider: AIProviderName;
  openaiApiKeyInput: string;
  isOpenAISelected: boolean;
  isValidatingKey: boolean;
  providerStatus: string;
  onProviderChange: (provider: AIProviderName) => void;
  onOpenAIApiKeyChange: (value: string) => void;
  onVerifyOpenAIKey: () => void | Promise<void>;
};

export function ProviderSelector({
  selectedProvider,
  openaiApiKeyInput,
  isOpenAISelected,
  isValidatingKey,
  providerStatus,
  onProviderChange,
  onOpenAIApiKeyChange,
  onVerifyOpenAIKey,
}: ProviderSelectorProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3">
        <Text as="label" variant="body" className="font-medium text-slate-800">
          AI Provider
        </Text>

        <Select
          value={selectedProvider}
          onChange={(event) =>
            onProviderChange(event.target.value as AIProviderName)
          }
          fullWidth
          controlSize="md"
          variant="default"
        >
          <option value="ollama">Ollama (default)</option>
          <option value="openai">OpenAI</option>
        </Select>

        {isOpenAISelected ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="password"
              value={openaiApiKeyInput}
              onChange={(event) => onOpenAIApiKeyChange(event.target.value)}
              placeholder="Enter OpenAI API key (sk-...)"
              fullWidth
              controlSize="md"
              variant="default"
              className="flex-1"
            />
            <Button
              type="button"
              onClick={onVerifyOpenAIKey}
              isLoading={isValidatingKey}
              variant="primary"
              size="md"
            >
              {isValidatingKey ? "Verifying..." : "Verify key"}
            </Button>
          </div>
        ) : null}

        <Text variant="caption" aria-live="polite">
          {providerStatus}
        </Text>
      </div>
    </section>
  );
}
