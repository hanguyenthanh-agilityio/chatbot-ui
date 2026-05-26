import type { ComponentProps } from "react";
import { ChatEmptyState } from "@/components/chat/empty-state";
import { QUICK_ACTIONS_BY_ROLE } from "@/constants/chat";

export type MockChatEmptyStateProps = ComponentProps<typeof ChatEmptyState>;

export function mockChatEmptyStateProps(
  overrides?: Partial<MockChatEmptyStateProps>,
): MockChatEmptyStateProps {
  return {
    quickActions: QUICK_ACTIONS_BY_ROLE.user,
    onSelectPrompt: () => {},
    ...overrides,
  };
}
