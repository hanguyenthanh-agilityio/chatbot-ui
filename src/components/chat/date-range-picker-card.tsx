"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { cn } from "@/utils/class-name";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
// Monday-first; indices 5 (Sa) and 6 (Su) are always dimmed/disabled
const WEEK_HEADERS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function buildIso(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function getTodayIso(): string {
  const n = new Date();
  return buildIso(n.getFullYear(), n.getMonth(), n.getDate());
}

function isWeekend(iso: string): boolean {
  const [y, m, d] = iso.split("-").map(Number);
  const dow = new Date(y, m - 1, d).getDay(); // 0=Sun, 6=Sat
  return dow === 0 || dow === 6;
}

function buildCalendarGrid(year: number, month: number): (string | null)[] {
  const firstDow = new Date(year, month, 1).getDay(); // 0=Sun
  const offset = (firstDow + 6) % 7; // Mon-first: Mon=0 … Sun=6
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const grid: (string | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) grid.push(buildIso(year, month, d));
  while (grid.length % 7 !== 0) grid.push(null);
  return grid;
}

function fmtShort(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type HalfDay = "morning" | "afternoon";

type DateRangePickerCardProps = {
  onSubmit: (message: string) => void;
  disabled?: boolean;
};

export function DateRangePickerCard({ onSubmit, disabled }: DateRangePickerCardProps) {
  const [today] = useState(getTodayIso);
  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth();

  const [viewYear, setViewYear] = useState(curYear);
  const [viewMonth, setViewMonth] = useState(curMonth);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [halfDay, setHalfDay] = useState<HalfDay | null>(null);
  const [pickingEnd, setPickingEnd] = useState(false);

  const grid = useMemo(() => buildCalendarGrid(viewYear, viewMonth), [viewYear, viewMonth]);
  const isSingleDay = Boolean(startDate && endDate && startDate === endDate);
  const canConfirm = Boolean(startDate && endDate);
  const canGoPrev = viewYear > curYear || (viewYear === curYear && viewMonth > curMonth);

  function goMonth(delta: number) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    if (y < curYear || (y === curYear && m < curMonth)) return;
    setViewYear(y);
    setViewMonth(m);
  }

  function handleDay(iso: string) {
    if (disabled || iso < today || isWeekend(iso)) return;
    if (!pickingEnd) {
      setStartDate(iso);
      setEndDate(null);
      setHalfDay(null);
      setPickingEnd(true);
    } else {
      if (iso < startDate!) {
        // Clicked before start → restart selection from this date
        setStartDate(iso);
        setEndDate(null);
        setHalfDay(null);
      } else {
        setEndDate(iso);
        setHalfDay(null);
      }
    }
  }

  function handleClear() {
    setStartDate(null);
    setEndDate(null);
    setHalfDay(null);
    setPickingEnd(false);
  }

  function handleConfirm() {
    if (!startDate || !endDate) return;
    if (isSingleDay && halfDay) {
      onSubmit(`${halfDay} of ${startDate}`);
    } else {
      onSubmit(`${startDate} to ${endDate}`);
    }
  }

  function getCellClass(iso: string): string {
    const isPast = iso < today;
    const isWknd = isWeekend(iso);
    const isStart = iso === startDate;
    const isEnd = iso === endDate;
    const isToday = iso === today;
    const inRange =
      Boolean(startDate && endDate) &&
      iso > startDate! &&
      iso < endDate! &&
      !isWknd;

    if (isStart || isEnd) {
      return "bg-white text-slate-900 font-semibold cursor-pointer";
    }
    if (isPast || isWknd) {
      return cn("cursor-not-allowed select-none", isWknd ? "text-white/18" : "text-white/22");
    }
    if (inRange) return "bg-white/12 text-white cursor-pointer";
    if (isToday) return "ring-1 ring-white/35 text-white cursor-pointer hover:bg-white/10";
    return "text-white/72 cursor-pointer hover:bg-white/10";
  }

  const statusLine = (() => {
    if (!startDate) return "Pick a start date";
    if (!endDate) return `${fmtShort(startDate)} → pick end date`;
    if (isSingleDay && halfDay) return `${fmtShort(startDate)} · ${halfDay} only`;
    if (isSingleDay) return fmtShort(startDate);
    return `${fmtShort(startDate)} – ${fmtShort(endDate)}`;
  })();

  return (
    <Card className="w-fit max-w-full px-4 py-3 shadow-[0_10px_26px_rgba(7,12,30,0.25)]">
      <Text as="p" variant="sectionTitle">Select dates</Text>

      {/* Month navigation */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => goMonth(-1)}
          disabled={!canGoPrev || disabled}
          className="flex h-6 w-6 items-center justify-center rounded text-white/50 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:text-white/22"
        >
          <svg viewBox="0 0 16 16" fill="none" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </button>
        <span className="font-dm-sans text-sm font-medium text-white">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => goMonth(1)}
          disabled={disabled}
          className="flex h-6 w-6 items-center justify-center rounded text-white/50 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:text-white/22"
        >
          <svg viewBox="0 0 16 16" fill="none" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </button>
      </div>

      {/* Calendar grid */}
      <div className="mt-2 grid grid-cols-7 gap-y-0.5">
        {WEEK_HEADERS.map((h, i) => (
          <div
            key={`hdr-${i}`}
            className={cn(
              "py-1 text-center font-dm-sans text-xs font-medium",
              i >= 5 ? "text-white/18" : "text-white/40",
            )}
          >
            {h}
          </div>
        ))}

        {grid.map((iso, i) =>
          iso ? (
            <button
              key={iso}
              type="button"
              onClick={() => handleDay(iso)}
              disabled={disabled || iso < today || isWeekend(iso)}
              className={cn(
                "flex h-7 w-full items-center justify-center rounded-md font-dm-sans text-xs transition",
                getCellClass(iso),
              )}
            >
              {Number(iso.slice(8))}
            </button>
          ) : (
            <div key={`e-${i}`} />
          ),
        )}
      </div>

      {/* Half-day toggle — only shown when a single day is selected */}
      {isSingleDay && (
        <div className="mt-3 flex gap-1.5 rounded-lg border border-white/10 p-1">
          {(["morning", "afternoon"] as HalfDay[]).map((type) => (
            <button
              key={type}
              type="button"
              disabled={disabled}
              onClick={() => setHalfDay(halfDay === type ? null : type)}
              className={cn(
                "flex-1 rounded-md px-2 py-1.5 font-dm-sans text-xs font-medium transition",
                halfDay === type
                  ? "bg-white/16 text-white"
                  : "text-white/40 hover:bg-white/8 hover:text-white/70",
              )}
            >
              {type === "morning" ? "Morning only" : "Afternoon only"}
            </button>
          ))}
        </div>
      )}

      {/* Status + actions */}
      <div className="mt-3 flex items-center gap-2">
        <span className="flex-1 truncate font-dm-sans text-xs text-white/42">
          {statusLine}
        </span>
        {(startDate || endDate) && (
          <button
            type="button"
            disabled={disabled}
            onClick={handleClear}
            className="shrink-0 font-dm-sans text-xs text-white/30 transition hover:text-white/60"
          >
            Clear
          </button>
        )}
        <Button
          type="button"
          size="sm"
          variant="primary"
          disabled={!canConfirm || disabled}
          onClick={handleConfirm}
        >
          Confirm
        </Button>
      </div>
    </Card>
  );
}
