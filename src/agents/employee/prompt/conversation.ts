import type { MockAuthSession } from "@/lib/auth/session";
import { EMPLOYEE_AGENT_SYSTEM_PROMPT } from "./system";

/**
 * Builds employee conversation prompt.
 * @param {MockAuthSession} session
 * @returns {string}
 */
export function buildEmployeeConversationPrompt(session: MockAuthSession): string {
  return `${EMPLOYEE_AGENT_SYSTEM_PROMPT}

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
