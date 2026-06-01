import type { ComponentProps } from "react";
import { ChatEmptyState } from "@/components/chat/empty-state";

export type MockChatEmptyStateProps = ComponentProps<typeof ChatEmptyState>;

export function mockChatEmptyStateProps(
  _overrides?: Partial<MockChatEmptyStateProps>,
): MockChatEmptyStateProps {
  return {};
}

export { ChatEmptyState };
