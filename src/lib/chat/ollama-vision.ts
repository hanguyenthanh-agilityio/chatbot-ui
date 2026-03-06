const DEFAULT_OLLAMA_TAGS_ENDPOINT = "http://localhost:11434/api/tags";
const DEFAULT_OLLAMA_VISION_MODEL_CANDIDATES = [
  "gemma3:4b",
  "llama3.2-vision:11b",
  "llava:13b",
  "llava:7b",
  "moondream:latest",
] as const;

function isLikelyVisionModel(modelId: string): boolean {
  const normalized = modelId.toLowerCase();

  return (
    normalized.includes("vision") ||
    normalized.includes("gemma3") ||
    normalized.includes("llava") ||
    normalized.includes("moondream") ||
    normalized.includes("pixtral")
  );
}

async function getInstalledOllamaModelIds(
  tagsEndpoint: string,
): Promise<string[]> {
  try {
    const response = await fetch(tagsEndpoint, {
      signal: AbortSignal.timeout(2_500),
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as {
      models?: Array<{ name?: string; model?: string }>;
    };

    const modelIds = (data.models ?? []).flatMap((entry) =>
      [entry.name, entry.model].filter(
        (value): value is string =>
          typeof value === "string" && value.trim().length > 0,
      ),
    );

    return Array.from(new Set(modelIds));
  } catch {
    return [];
  }
}

function findInstalledModelMatch(
  installedModelIds: string[],
  candidate: string,
): string | null {
  const normalizedCandidate = candidate.trim().toLowerCase();
  if (!normalizedCandidate) return null;

  const byExactMatch = installedModelIds.find(
    (installed) => installed.toLowerCase() === normalizedCandidate,
  );

  if (byExactMatch) {
    return byExactMatch;
  }

  if (!normalizedCandidate.includes(":")) {
    const latestCandidate = `${normalizedCandidate}:latest`;

    const latestMatch = installedModelIds.find(
      (installed) => installed.toLowerCase() === latestCandidate,
    );

    if (latestMatch) {
      return latestMatch;
    }
  }

  return null;
}

export async function resolveOllamaVisionModel({
  tagsEndpointOverride,
}: {
  tagsEndpointOverride?: string;
} = {}): Promise<{ modelId: string } | { errorMessage: string }> {
  const preferredFromEnv = process.env.OLLAMA_VISION_MODEL?.trim();
  const tagsEndpoint =
    tagsEndpointOverride?.trim() ||
    process.env.OLLAMA_TAGS_ENDPOINT ||
    DEFAULT_OLLAMA_TAGS_ENDPOINT;
  const installedModelIds = await getInstalledOllamaModelIds(tagsEndpoint);

  // If tags API is unavailable, keep deterministic fallback behavior.
  if (installedModelIds.length === 0) {
    return {
      modelId: preferredFromEnv || DEFAULT_OLLAMA_VISION_MODEL_CANDIDATES[0],
    };
  }

  const orderedCandidates = [
    preferredFromEnv,
    ...DEFAULT_OLLAMA_VISION_MODEL_CANDIDATES,
  ].filter((value): value is string => Boolean(value?.trim()));

  for (const candidate of orderedCandidates) {
    const match = findInstalledModelMatch(installedModelIds, candidate);
    if (match) {
      return { modelId: match };
    }
  }

  const firstInstalledVisionModel = installedModelIds.find((modelId) =>
    isLikelyVisionModel(modelId),
  );

  if (firstInstalledVisionModel) {
    return { modelId: firstInstalledVisionModel };
  }

  return {
    errorMessage: `No Ollama vision model is installed for image Q&A. Install one with \`ollama pull gemma3:4b\` (or set OLLAMA_VISION_MODEL). Installed models: ${installedModelIds.join(", ")}`,
  };
}
