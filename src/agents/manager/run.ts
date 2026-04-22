import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type LanguageModel,
  type UIMessage,
} from "ai";
import type { MockAuthSession } from "@/lib/auth/session";
import { getAgentMetadata } from "@/agents/shared/response";
import { MANAGER_AGENT_SYSTEM_PROMPT } from "@/agents/manager/prompts";
import { createManagerTools } from "@/agents/manager/tools";
import { getErrorMessage } from "@/utils/error-message";

function buildManagerSystemPrompt(session: MockAuthSession) {
  const managedEmployees = session.managedEmployees
    .map((employee) => `- ${employee.name} (${employee.employeeId}, ${employee.team})`)
    .join("\n");

  return `${MANAGER_AGENT_SYSTEM_PROMPT}

Current manager:
- name: ${session.name}
- employeeId: ${session.employeeId}
- email: ${session.email}
- team: ${session.team}

Direct reports:
${managedEmployees || "- none"}
`.trim();
}

export async function runManagerAgent(input: {
  model: LanguageModel;
  messages: UIMessage[];
  session: MockAuthSession;
}) {
  const modelMessages = await convertToModelMessages(input.messages);
  const result = streamText({
    model: input.model,
    system: buildManagerSystemPrompt(input.session),
    messages: modelMessages,
    tools: createManagerTools(input.session),
    stopWhen: stepCountIs(6),
    temperature: 0.2,
  });

  return result.toUIMessageStreamResponse({
    onError: (error) => getErrorMessage(error),
    messageMetadata: ({ part }) =>
      part.type === "start" || part.type === "finish"
        ? getAgentMetadata("manager", input.session.role)
        : undefined,
  });
}
