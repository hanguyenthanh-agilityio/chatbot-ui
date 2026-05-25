import type { UIMessage } from "ai";
import { getToolOutputTables } from "@/components/transcript/tool-output";
import {
  FIXTURE_BALANCES,
  FIXTURE_MEMBER_ROW,
} from "@/mocks/time-off-fixtures";

export {
  FIXTURE_BALANCE,
  FIXTURE_MEMBER,
  FIXTURE_REQUEST,
} from "@/mocks/time-off-fixtures";

export function createToolPart(
  toolName: string,
  output?: unknown,
  partial: Record<string, unknown> = {},
): UIMessage["parts"][number] {
  return {
    type: `tool-${toolName}`,
    toolCallId: `tc-${toolName}`,
    state: "output-available",
    input: {},
    ...partial,
    ...(output !== undefined ? { output } : {}),
  } as UIMessage["parts"][number];
}

export function mockBalanceToolPart(): UIMessage["parts"][number] {
  return createToolPart("get_my_time_off_balance", {
    balances: [FIXTURE_BALANCES[0]],
  });
}

export function mockTeamMembersToolPart(): UIMessage["parts"][number] {
  return createToolPart("list_team_members", {
    members: [FIXTURE_MEMBER_ROW],
  });
}

export function getTablesFromToolPart(part: UIMessage["parts"][number]) {
  return getToolOutputTables(part);
}
