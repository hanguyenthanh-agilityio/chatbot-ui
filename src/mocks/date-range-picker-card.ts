import type { ComponentProps } from "react";
import { DateRangePickerCard } from "@/components/chat/date-range-picker-card";

export type MockDateRangePickerCardProps = ComponentProps<
  typeof DateRangePickerCard
>;

export function mockDateRangePickerCardProps(
  overrides?: Partial<MockDateRangePickerCardProps>,
): MockDateRangePickerCardProps {
  return {
    onSubmit: () => {},
    disabled: false,
    ...overrides,
  };
}
