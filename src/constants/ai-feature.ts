export const CHAT_FEATURE_OPTIONS = [
  {
    value: "core",
    label: "Default",
    hint: "Baseline streamText flow for normal chat.",
  },
  {
    value: "tool",
    label: "Tool",
    hint: "Model calls one server tool and then answers.",
  },
  {
    value: "agent",
    label: "Agent",
    hint: "Model can chain weather, FX, and client context tools.",
  },
  {
    value: "multi-agent",
    label: "Multi-Agent",
    hint: "Planner, researcher, and writer agent pipeline.",
  },
  {
    value: "prompt",
    label: "Prompt",
    hint: "Deterministic output format with strict instructions.",
  },
  {
    value: "mcp",
    label: "MCP",
    hint: "Use tools discovered from an MCP server.",
  },
] as const;

export type ChatFeatureMode = (typeof CHAT_FEATURE_OPTIONS)[number]["value"];

export const DEFAULT_CHAT_FEATURE_MODE: ChatFeatureMode = "core";

export function isChatFeatureMode(value: string): value is ChatFeatureMode {
  return CHAT_FEATURE_OPTIONS.some((option) => option.value === value);
}
