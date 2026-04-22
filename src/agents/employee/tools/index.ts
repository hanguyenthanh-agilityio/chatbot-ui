import type { MockAuthSession } from "@/lib/auth/session";
import { createEmployeeReadTools } from "./read";
import { createEmployeeMutationTools } from "./mutation";

/**
 * Creates employee tools.
 * @param {MockAuthSession} session
 */
export function createEmployeeTools(session: MockAuthSession) {
  return {
    ...createEmployeeReadTools(session),
    ...createEmployeeMutationTools(session),
  };
}
