import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ChatEmptyState } from '@/components/chat/empty-state';
import { CHAT_EMPTY_STATE_COPY } from '@/constants/chat';
import { mockChatEmptyStateProps } from '@/mocks/empty-state';

describe('ChatEmptyState', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders title and description from CHAT_EMPTY_STATE_COPY', () => {
    const props = mockChatEmptyStateProps();
    render(<ChatEmptyState {...props} />);

    expect(screen.getByText(CHAT_EMPTY_STATE_COPY.title)).toBeInTheDocument();
    expect(
      screen.getByText(CHAT_EMPTY_STATE_COPY.description),
    ).toBeInTheDocument();
  });

  it('renders a button for each quick action', () => {
    const props = mockChatEmptyStateProps();
    render(<ChatEmptyState {...props} />);

    for (const action of props.quickActions) {
      expect(
        screen.getByRole('button', { name: action.label }),
      ).toBeInTheDocument();
    }
  });

  it('calls onSelectPrompt with the action prompt when a chip is clicked', async () => {
    const user = userEvent.setup();
    const onSelectPrompt = vi.fn();
    const props = mockChatEmptyStateProps({ onSelectPrompt });

    render(<ChatEmptyState {...props} />);
    await user.click(
      screen.getByRole('button', { name: props.quickActions[0]!.label }),
    );

    expect(onSelectPrompt).toHaveBeenCalledTimes(1);
    expect(onSelectPrompt).toHaveBeenCalledWith(props.quickActions[0]!.prompt);
  });
});
