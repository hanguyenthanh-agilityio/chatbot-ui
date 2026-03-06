import {
  CHAT_FEATURE_OPTIONS,
  type ChatFeatureMode,
} from "@/constants/ai-feature";
import { Select } from "@/components/ui/select";
import { Text } from "@/components/ui/text";

type FeatureSelectorProps = {
  selectedFeature: ChatFeatureMode;
  withContainer?: boolean;
  disabledFeatures?: ChatFeatureMode[];
  onFeatureChange: (feature: ChatFeatureMode) => void;
};

export function FeatureSelector({
  selectedFeature,
  withContainer = true,
  disabledFeatures = [],
  onFeatureChange,
}: FeatureSelectorProps) {
  const selectedOption = CHAT_FEATURE_OPTIONS.find(
    (option) => option.value === selectedFeature,
  );
  const disabledSet = new Set(disabledFeatures);

  const content = (
    <div className="flex flex-col gap-2">
      <Text as="label" variant="body" className="font-medium text-slate-800">
        AI SDK Mode
      </Text>

      <Select
        value={selectedFeature}
        onChange={(event) =>
          onFeatureChange(event.target.value as ChatFeatureMode)
        }
        fullWidth
        controlSize="md"
        variant="default"
      >
        {CHAT_FEATURE_OPTIONS.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={disabledSet.has(option.value)}
          >
            {option.label}
          </option>
        ))}
      </Select>

      <Text variant="caption" className="min-h-4">
        {selectedOption?.hint}
      </Text>
    </div>
  );

  if (!withContainer) return content;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {content}
    </section>
  );
}
