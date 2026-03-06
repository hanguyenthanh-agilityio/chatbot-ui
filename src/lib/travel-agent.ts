import { ToolLoopAgent, type LanguageModel, stepCountIs } from "ai";
import { getAgentToolSet } from "@/lib/demo-tools";

export function createTravelPlanningAgent(model: LanguageModel) {
  return new ToolLoopAgent({
    model,
    // Focus the agent on practical multi-tool planning output.
    instructions: `You are a travel copilot.
- Prefer tool usage when weather, cost, or local tips are needed.
- If tools return data, synthesize into one actionable plan.
- Keep responses concise and in markdown bullet points.`,
    tools: getAgentToolSet(),
    stopWhen: stepCountIs(8),
    temperature: 0,
  });
}
