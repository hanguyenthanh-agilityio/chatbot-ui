import { streamAgent } from "./streaming";
import type { AgentName, AgentRunInput } from "./types";

type SpecialistAgentName = Exclude<AgentName, "coordinator">;
type StreamAgentInput = Parameters<typeof streamAgent>[0];

type RunSpecialistAgentInput = {
  agent: SpecialistAgentName;
  input: AgentRunInput;
  system: string;
  tools: StreamAgentInput["tools"];
};

/**
 * runSpecialistAgent helper.
 * @param {RunSpecialistAgentInput} input
 */
export async function runSpecialistAgent(input: RunSpecialistAgentInput) {
  return streamAgent({
    model: input.input.model,
    messages: input.input.messages,
    system: input.system,
    tools: input.tools,
    agent: input.agent,
    accessRole: input.input.session.role,
    provider: input.input.provider,
    modelId: input.input.modelId,
    onRunStats: input.input.onRunStats,
  });
}
