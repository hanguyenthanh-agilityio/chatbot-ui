import type { AIProviderName } from "@/lib/ai-provider";
import { isProductionLike } from "@/lib/runtime-env";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import {
  DEFAULT_PROVIDER_OPTIONS,
  PROVIDER_OPTION_LABEL,
  PROVIDER_PANEL_COPY,
} from "@/constants/provider";

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
  allowedProviders = DEFAULT_PROVIDER_OPTIONS,
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
        <Text as="label" variant="sectionTitle">
          {PROVIDER_PANEL_COPY.label}
        </Text>
        <Text variant="captionStrong">
          {PROVIDER_PANEL_COPY.description}
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
        variant="dark"
      >
        {allowedProviders.includes("ollama") ? (
          <option value="ollama">{PROVIDER_OPTION_LABEL.ollama}</option>
        ) : null}
        {allowedProviders.includes("openai") ? (
          <option value="openai">{PROVIDER_OPTION_LABEL.openai}</option>
        ) : null}
      </Select>

      <Text variant="captionStrong" className="min-h-4" aria-live="polite">
        {providerStatus}
      </Text>

      {isOpenAISelected ? (
        <div className="flex flex-col gap-2">
          <Input
            type="password"
            value={openaiApiKeyInput}
            onChange={(event) => onOpenAIApiKeyChange(event.target.value)}
            placeholder={PROVIDER_PANEL_COPY.openaiApiKeyPlaceholder}
            fullWidth
            controlSize="md"
            variant="dark"
          />
          <Button
            type="button"
            onClick={onVerifyOpenAIKey}
            isLoading={isValidatingKey}
            variant="primary"
            size="md"
            fullWidth
          >
            {isValidatingKey
              ? PROVIDER_PANEL_COPY.verifyActionLoadingLabel
              : PROVIDER_PANEL_COPY.verifyOpenAIButtonLabel}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <Input
            type="url"
            value={ollamaBaseUrlInput}
            onChange={(event) => onOllamaBaseUrlChange(event.target.value)}
            placeholder={PROVIDER_PANEL_COPY.ollamaBaseUrlPlaceholder}
            fullWidth
            controlSize="md"
            variant="dark"
          />
          <Button
            type="button"
            onClick={onVerifyOllamaBaseUrl}
            isLoading={isValidatingOllamaBaseUrl}
            variant="ghost"
            size="md"
            fullWidth
            className="font-dm-sans border border-white/[.12] text-white/60 hover:bg-white/[.08]"
          >
            {isValidatingOllamaBaseUrl
              ? PROVIDER_PANEL_COPY.verifyActionLoadingLabel
              : PROVIDER_PANEL_COPY.verifyOllamaButtonLabel}
          </Button>
          <Text variant="captionMuted">
            {isProductionLike()
              ? PROVIDER_PANEL_COPY.productionOllamaHint
              : PROVIDER_PANEL_COPY.localOllamaHint}
          </Text>
        </div>
      )}
    </div>
  );

  if (!withContainer) return content;

  return (
    <Card variant="panel" className="p-4">
      {content}
    </Card>
  );
}
