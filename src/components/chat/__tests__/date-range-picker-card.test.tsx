import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DateRangePickerCard } from '@/components/chat/date-range-picker-card';
import { mockDateRangePickerCardProps } from '@/mocks/date-range-picker-card';

describe('DateRangePickerCard', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the section title and month navigation', () => {
    render(<DateRangePickerCard {...mockDateRangePickerCardProps()} />);

    expect(screen.getByText('Select dates')).toBeInTheDocument();
    expect(screen.getByLabelText('Previous month')).toBeInTheDocument();
    expect(screen.getByLabelText('Next month')).toBeInTheDocument();
    expect(screen.getByText(/\d{4}/)).toBeInTheDocument();
  });

  it('shows morning and afternoon slot buttons when a start date is selected', () => {
    render(<DateRangePickerCard {...mockDateRangePickerCardProps()} />);

    expect(screen.getByRole('button', { name: 'Morning' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Afternoon' }),
    ).toBeInTheDocument();
  });

  it('calls onSubmit with a single-day range on confirm', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <DateRangePickerCard {...mockDateRangePickerCardProps({ onSubmit })} />,
    );
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const message = String(onSubmit.mock.calls[0]?.[0]);
    const [start, end] = message.split(' to ');
    expect(start).toBe(end);
    expect(start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('calls onSubmit with morning half-day when morning slot is active', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <DateRangePickerCard {...mockDateRangePickerCardProps({ onSubmit })} />,
    );
    await user.click(screen.getByRole('button', { name: 'Morning' }));
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(String(onSubmit.mock.calls[0]?.[0])).toMatch(
      /^morning of \d{4}-\d{2}-\d{2}$/,
    );
  });

  it('clears selection when Clear is clicked', async () => {
    const user = userEvent.setup();

    render(<DateRangePickerCard {...mockDateRangePickerCardProps()} />);
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Clear' }));

    expect(
      screen.queryByRole('button', { name: 'Morning' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled();
  });

  it('disables confirm when disabled prop is true', () => {
    render(
      <DateRangePickerCard
        {...mockDateRangePickerCardProps({ disabled: true })}
      />,
    );

    expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled();
  });
});
