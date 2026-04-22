import type { UIMessage } from "ai";
import type { MockAuthSession } from "@/lib/auth/session";
import { getTextParts } from "@/utils/chat-message";

export type CoordinatorDecision =
  | { type: "delegate"; specialist: "time-off" | "manager" }
  | { type: "deny"; message: string };

const MANAGER_INTENT_PATTERNS = [
  /\bapprove\b/i,
  /\breject\b/i,
  /\bteam\b/i,
  /\bdirect\s+report/i,
  /\bcoverage\b/i,
  /\bapproval/i,
  /\bemployee\b/i,
];

function getLatestUserText(messages: UIMessage[]): string {
  const latestUserMessage = [...messages]
    .reverse()
    .find((m) => m.role === "user");

  if (!latestUserMessage) return "";
  return getTextParts(latestUserMessage).join(" ").trim();
}

function hasManagedEmployeeReference(session: MockAuthSession, text: string) {
  const normalized = text.toLowerCase();

  return session.managedEmployees.some((employee) =>
    [employee.name, employee.email, employee.employeeId]
      .map((v) => v.toLowerCase())
      .some((token) => normalized.includes(token)),
  );
}

export function routeConversation(input: {
  messages: UIMessage[];
  session: MockAuthSession;
}): CoordinatorDecision {
  const latestUserText = getLatestUserText(input.messages);
  const isManagerIntent =
    MANAGER_INTENT_PATTERNS.some((p) => p.test(latestUserText)) ||
    hasManagedEmployeeReference(input.session, latestUserText);

  if (!isManagerIntent) {
    return { type: "delegate", specialist: "time-off" };
  }

  if (input.session.role !== "manager") {
    return {
      type: "deny",
      message:
        "Manager actions are only available in manager mode. Switch to Manager mode in the sidebar, then try again.",
    };
  }

  return { type: "delegate", specialist: "manager" };
}
