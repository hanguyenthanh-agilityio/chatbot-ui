import { runSpecialistAgent, type AgentRunInput } from "@/agents/chat-core";
import { buildManagerConversationPrompt } from "@/agents/manager/prompt/conversation";
import { createManagerTools } from "@/agents/manager/tools";

/**
 * runManagerAgent helper.
 * @param {AgentRunInput} input
 */
export async function runManagerAgent(input: AgentRunInput) {
  return runSpecialistAgent({
    agent: "manager",
    input,
    system: buildManagerConversationPrompt(input.session),
    tools: createManagerTools(input.session),
  });
}
