import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type LanguageModel,
  type UIMessage,
} from "ai";
import type { MockAuthSession } from "@/lib/auth/session";
import { getAgentMetadata } from "@/agents/shared/response";
import { TIME_OFF_AGENT_SYSTEM_PROMPT } from "@/agents/time-off/prompts";
import { createTimeOffTools } from "@/agents/time-off/tools";
import { getErrorMessage } from "@/utils/error-message";

function buildTimeOffSystemPrompt(session: MockAuthSession) {
  return `${TIME_OFF_AGENT_SYSTEM_PROMPT}

Current access role: ${session.roleLabel}
Current user:
- name: ${session.name}
- employeeId: ${session.employeeId}
- email: ${session.email}
- team: ${session.team}
- manager: ${session.manager}
- timezone: ${session.timeZone}
`.trim();
}

export async function runTimeOffAgent(input: {
  model: LanguageModel;
  messages: UIMessage[];
  session: MockAuthSession;
}) {
  const modelMessages = await convertToModelMessages(input.messages);
  const result = streamText({
    model: input.model,
    system: buildTimeOffSystemPrompt(input.session),
    messages: modelMessages,
    tools: createTimeOffTools(input.session),
    stopWhen: stepCountIs(6),
    temperature: 0.2,
  });

  return result.toUIMessageStreamResponse({
    onError: (error) => getErrorMessage(error),
    messageMetadata: ({ part }) =>
      part.type === "start" || part.type === "finish"
        ? getAgentMetadata("time-off", input.session.role)
        : undefined,
  });
}
