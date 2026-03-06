import type { ChatFeatureMode } from "@/constants/ai-feature";
import {
  getAgentToolSet,
  getMultiToolSet,
  getSingleToolSet,
} from "@/lib/demo-tools";

export const FEATURE_SYSTEM_PROMPTS: Record<ChatFeatureMode, string> = {
  core: "You are a helpful assistant.",
  tool: "You are a tool-aware assistant. When location weather data is needed, call the tool before answering.",
  agent:
    "You are a planning assistant. Combine weather, currency, city tips, and client context tools when needed.",
  "multi-agent":
    "You coordinate a multi-agent pipeline (planner, researcher, writer).",
  prompt: `You are a precise assistant.
- Respond in markdown.
- Structure: Goal, Key Assumptions, Plan, Risks.
- Keep the answer practical and concise.
- If key constraints are missing, ask exactly 2 follow-up questions.`,
  mcp: "You are an MCP-enabled assistant. Prefer MCP tools when they can improve the answer.",
};

export function getToolsForMode(mode: ChatFeatureMode) {
  switch (mode) {
    case "tool":
      return getSingleToolSet();
    case "agent":
      return getMultiToolSet();
    default:
      return undefined;
  }
}

export function getMultiAgentResearchToolSet() {
  return getAgentToolSet();
}
