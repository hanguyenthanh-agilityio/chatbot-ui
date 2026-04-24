import { useMemo, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/utils/class-name";

export type ToolOutputTableColumn = {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  className?: string;
};

export type ToolOutputTableRow = Record<string, ReactNode>;
export type ToolOutputTableAction = {
  label: string;
  prompt: string;
  tone?: "neutral" | "success" | "danger";
};

type ToolOutputTableProps = {
  title: string;
  columns: ToolOutputTableColumn[];
  rows: ToolOutputTableRow[];
  rowActions?: ToolOutputTableAction[][];
  rowActionSummaries?: string[];
  onActionClick?: (prompt: string) => void;
  disableActions?: boolean;
  emptyLabel?: string;
};

const TEXT_ALIGN_CLASS: Record<
  NonNullable<ToolOutputTableColumn["align"]>,
  string
> = {
  left: "text-left",
  center: "text-left sm:text-center",
  right: "text-left sm:text-right",
};

function getAlignClass(align?: ToolOutputTableColumn["align"]) {
  return TEXT_ALIGN_CLASS[align ?? "left"];
}

function getGridClass(columnCount: number) {
  if (columnCount <= 1) return "grid-cols-1";
  if (columnCount === 2) return "grid-cols-1 sm:grid-cols-2";
  if (columnCount === 3) return "grid-cols-1 sm:grid-cols-3";
  if (columnCount === 4) return "grid-cols-1 sm:grid-cols-4";
  return "grid-cols-1 sm:grid-cols-5";
}

function getDesktopTemplateClass(columns: ToolOutputTableColumn[]) {
  const keySignature = columns.map((column) => column.key).join("|");

  if (keySignature === "leaveType|allowance|used|pending|remaining") {
    return "sm:[grid-template-columns:minmax(148px,1.2fr)_minmax(84px,0.65fr)_minmax(84px,0.65fr)_minmax(84px,0.65fr)_minmax(96px,0.65fr)]";
  }

  if (keySignature === "employee|leaveType|dateRange|days|status") {
    return "sm:[grid-template-columns:minmax(260px,2.8fr)_minmax(104px,0.9fr)_minmax(118px,1fr)_max-content_max-content]";
  }

  if (keySignature === "leaveType|dateRange|days|status") {
    return "sm:[grid-template-columns:minmax(142px,1fr)_minmax(148px,1fr)_72px_124px]";
  }

  return "";
}

function getGridGapClass(columns: ToolOutputTableColumn[]) {
  const keySignature = columns.map((column) => column.key).join("|");

  if (
    keySignature === "employee|leaveType|dateRange|days|status" ||
    keySignature === "employee|leaveType|dateRange|days|status|__actions"
  ) {
    return "gap-x-5";
  }

  if (
    keySignature === "leaveType|dateRange|days|status" ||
    keySignature === "leaveType|dateRange|days|status|__actions"
  ) {
    return "gap-x-3";
  }

  return "gap-x-3";
}

const ACTION_TONE_CLASS: Record<
  NonNullable<ToolOutputTableAction["tone"]>,
  string
> = {
  neutral:
    "border-white/20 bg-white/[.08] text-white/80 hover:border-white/30 hover:bg-white/[.14]",
  success:
    "border-emerald-400/35 bg-emerald-500/14 text-emerald-100 hover:border-emerald-300/45 hover:bg-emerald-500/24",
  danger:
    "border-rose-400/35 bg-rose-500/14 text-rose-100 hover:border-rose-300/45 hover:bg-rose-500/24",
};

export function ToolOutputTable({
  title,
  columns,
  rows,
  rowActions,
  rowActionSummaries,
  onActionClick,
  disableActions = false,
  emptyLabel = "No records found.",
}: ToolOutputTableProps) {
  const recordCount = rows.length;
  const renderColumns = columns;
  const actionableRowIndexes = useMemo(
    () =>
      (rowActions ?? [])
        .map((actions, index) => (actions.length > 0 ? index : -1))
        .filter((index) => index >= 0),
    [rowActions],
  );
  const hasRowActions =
    Boolean(onActionClick) && actionableRowIndexes.length > 0;
  const [manualSelectedRowIndex, setManualSelectedRowIndex] = useState<number | null>(null);
  const selectedRowIndex = hasRowActions
    ? manualSelectedRowIndex !== null &&
      actionableRowIndexes.includes(manualSelectedRowIndex)
      ? manualSelectedRowIndex
      : (actionableRowIndexes.at(-1) ?? null)
    : null;

  const desktopTemplateClass = getDesktopTemplateClass(renderColumns);
  const gridClassName = cn(
    "grid",
    getGridGapClass(renderColumns),
    getGridClass(renderColumns.length),
    desktopTemplateClass,
  );

  function handleSelectableRowKeyDown(
    event: KeyboardEvent<HTMLDivElement>,
    rowIndex: number,
  ) {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    setManualSelectedRowIndex(rowIndex);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-white/12 bg-[linear-gradient(170deg,rgba(116,116,145,0.26),rgba(64,62,93,0.34))] backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.26)]">
      <div className="flex items-center justify-between gap-2 border-b border-white/[.10] px-3.5 py-2.5">
        <p className="font-syne text-[11px] font-semibold uppercase tracking-[0.16em] text-white/75">
          {title}
        </p>
        <span className="rounded-full border border-white/15 bg-white/[.06] px-2.5 py-0.5 text-[10px] font-medium text-white/55">
          {recordCount} {recordCount === 1 ? "record" : "records"}
        </span>
      </div>

      <div className="p-2.5">
        {rows.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-white/[.09] bg-[#201f3d]/55">
            <div
              className={cn(
                "hidden sm:grid items-center border-b border-white/[.08] bg-white/[.04] px-3 py-2",
                gridClassName,
              )}
            >
              {columns.map((column) => (
                <p
                  key={`${title}-header-${column.key}`}
                  className={cn(
                    "font-dm-sans text-[10px] uppercase tracking-[0.14em] text-white/45",
                    getAlignClass(column.align),
                  )}
                >
                  {column.label}
                </p>
              ))}
            </div>

            {rows.map((row, rowIndex) => {
              const rowHasActions = (rowActions?.[rowIndex]?.length ?? 0) > 0;
              const isSelected = hasRowActions && selectedRowIndex === rowIndex;
              const rowSelectedActions = rowActions?.[rowIndex] ?? [];
              const rowSummary =
                rowActionSummaries?.[rowIndex] ?? `Record ${rowIndex + 1}`;

              return (
                <div key={`${title}-${rowIndex}`}>
                  <div
                    role={hasRowActions && rowHasActions ? "button" : undefined}
                    tabIndex={hasRowActions && rowHasActions ? 0 : undefined}
                    onClick={
                      hasRowActions && rowHasActions
                        ? () => setManualSelectedRowIndex(rowIndex)
                        : undefined
                    }
                    onKeyDown={
                      hasRowActions && rowHasActions
                        ? (event) => handleSelectableRowKeyDown(event, rowIndex)
                        : undefined
                    }
                    className={cn(
                      "px-3 py-2.5",
                      rowIndex > 0 && "border-t border-white/[.07]",
                      rowIndex % 2 === 0 ? "bg-white/[.01]" : "bg-white/[.025]",
                      hasRowActions && rowHasActions && "cursor-pointer transition hover:bg-white/[.05]",
                      isSelected && "bg-violet-500/[.09] ring-1 ring-inset ring-violet-300/30",
                    )}
                  >
                    <div className={cn(gridClassName, "items-center gap-y-1.5")}>
                      {columns.map((column) => (
                        <div key={`${rowIndex}-${column.key}`} className="min-w-0">
                          <p className="font-dm-sans text-[10px] uppercase tracking-[0.14em] text-white/45 sm:hidden">
                            {column.label}
                          </p>
                          <div
                            className={cn(
                              "font-dm-sans text-[13px] leading-[1.35] text-white/88 break-words",
                              getAlignClass(column.align),
                              column.className,
                            )}
                          >
                            {row[column.key] ?? "—"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {isSelected && rowSelectedActions.length > 0 ? (
                    <div className="border-t border-white/[.08] bg-violet-500/[.08] px-3 py-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-dm-sans text-[12px] text-white/72">
                          <span className="text-white/55">Selected:</span>{" "}
                          {rowSummary}
                        </p>

                        <div className="flex flex-wrap items-center gap-1.5">
                          {rowSelectedActions.map((action, actionIndex) => (
                            <button
                              key={`${title}-selected-action-${rowIndex}-${actionIndex}`}
                              type="button"
                              disabled={disableActions}
                              onClick={() => onActionClick?.(action.prompt)}
                              className={cn(
                                "inline-flex h-7 items-center rounded-md border px-2.5 font-dm-sans text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
                                ACTION_TONE_CLASS[action.tone ?? "neutral"],
                              )}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-white/[.08] bg-white/[.04] px-3 py-3 text-sm text-white/55">
            {emptyLabel}
          </div>
        )}
      </div>
    </section>
  );
}
