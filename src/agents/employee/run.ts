import { runSpecialistAgent, type AgentRunInput } from "@/agents/chat-core";
import { buildEmployeeConversationPrompt } from "@/agents/employee/prompt/conversation";
import { createEmployeeTools } from "@/agents/employee/tools";

/**
 * runEmployeeAgent helper.
 * @param {AgentRunInput} input
 */
export async function runEmployeeAgent(input: AgentRunInput) {
  return runSpecialistAgent({
    agent: "employee",
    input,
    system: buildEmployeeConversationPrompt(input.session),
    tools: createEmployeeTools(input.session),
  });
}
