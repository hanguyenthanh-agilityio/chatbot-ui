import { useMemo, useState, type KeyboardEvent, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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

const TABLE_CELL_INSET = "px-2";

const TABLE_CELL_TRUNCATE_CLASS =
  "block min-w-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap";

const TABLE_CELL_JUSTIFY_CLASS: Record<
  NonNullable<ToolOutputTableColumn["align"]>,
  string
> = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
};

function getCellJustifyClass(align?: ToolOutputTableColumn["align"]) {
  return TABLE_CELL_JUSTIFY_CLASS[align ?? "left"];
}

function getCellTitle(value: ReactNode): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return undefined;
}

function TableCellValue({
  value,
  align,
  className,
}: {
  value: ReactNode;
  align?: ToolOutputTableColumn["align"];
  className?: string;
}) {
  const title = getCellTitle(value);
  const isPrimitive =
    typeof value === "string" ||
    typeof value === "number" ||
    value === null ||
    value === undefined;

  if (isPrimitive) {
    const display = value ?? "—";
    return (
      <div
        className={cn(
          "flex w-full min-w-0",
          TABLE_CELL_INSET,
          getCellJustifyClass(align),
        )}
      >
        <span
          className={cn(
            TABLE_CELL_TRUNCATE_CLASS,
            "text-compact-13 leading-table-cell text-white/90 light:text-app-fg",
            getAlignClass(align),
            className,
          )}
          title={title}
        >
          {display}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full min-w-0",
        TABLE_CELL_INSET,
        getCellJustifyClass(align),
      )}
      title={title}
    >
      <div className="min-w-0 max-w-full overflow-hidden [&_.inline-flex]:max-w-full">
        {value}
      </div>
    </div>
  );
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
    "border-white/22 bg-white/8 text-white/82 hover:border-white/34 hover:bg-white/14 light:border-app-border light:bg-app-surface-subtle light:text-app-fg-muted light:hover:border-app-border-emphasis light:hover:bg-app-hover",
  success:
    "border-emerald-400/36 bg-emerald-500/16 text-emerald-100 hover:border-emerald-300/46 hover:bg-emerald-500/24 light:border-emerald-300/70 light:bg-emerald-50 light:text-emerald-900 light:hover:border-emerald-400/80 light:hover:bg-emerald-100",
  danger:
    "border-rose-400/36 bg-rose-500/16 text-rose-100 hover:border-rose-300/46 hover:bg-rose-500/24 light:border-rose-300/70 light:bg-rose-50 light:text-rose-800 light:hover:border-rose-400/80 light:hover:bg-rose-100",
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
  const [manualSelectedRowIndex, setManualSelectedRowIndex] = useState<
    number | null
  >(null);
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
    <Card
      variant="glass"
      className={cn(
        "overflow-hidden border-white/12 shadow-table bg-glass-table",
        "light:border-app-border light:shadow-table light:backdrop-blur-none",
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3.5 py-2.5 light:border-app-border-subtle">
        <p className="font-primary text-compact-11 font-semibold uppercase tracking-table-title text-white/78 light:text-app-fg-quaternary">
          {title}
        </p>
        <Badge variant="subtle" size="sm">
          {recordCount} {recordCount === 1 ? "record" : "records"}
        </Badge>
      </div>
      <div className="p-2.5">
        {rows.length > 0 ? (
          <div
            className={cn(
              "overflow-hidden rounded-xl border border-white/9 bg-surface-muted",
              "light:border-app-border-subtle light:bg-app-surface-subtle",
            )}
          >
            <div
              className={cn(
                "hidden sm:grid items-center border-b border-white/8 bg-white/5 px-3 py-2",
                "light:border-app-border-subtle light:bg-app-surface-muted",
                gridClassName,
              )}
            >
              {columns.map((column) => (
                <div
                  key={`${title}-header-${column.key}`}
                  className={cn(
                    "min-w-0",
                    TABLE_CELL_INSET,
                    getCellJustifyClass(column.align),
                  )}
                >
                  <p
                    className={cn(
                      TABLE_CELL_TRUNCATE_CLASS,
                      "text-compact-10 uppercase tracking-table-label text-white/45 light:text-app-fg-tertiary",
                      getAlignClass(column.align),
                    )}
                    title={column.label}
                  >
                    {column.label}
                  </p>
                </div>
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
                    aria-label={
                      hasRowActions && rowHasActions
                        ? `Select ${rowSummary}`
                        : undefined
                    }
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
                      rowIndex > 0 &&
                        "border-t border-white/7 light:border-app-border-subtle",
                      rowIndex % 2 === 0
                        ? "bg-white/5 light:bg-white"
                        : "bg-white/10 light:bg-app-surface-subtle",
                      hasRowActions &&
                        rowHasActions &&
                        "cursor-pointer transition hover:bg-white/5 light:hover:bg-app-hover",
                      isSelected &&
                        "bg-violet-500/11 ring-1 ring-inset ring-violet-300/30 light:bg-amber-50/80 light:ring-amber-700/25",
                    )}
                  >
                    <div
                      className={cn(gridClassName, "items-center gap-y-1.5")}
                    >
                      {columns.map((column) => (
                        <div
                          key={`${rowIndex}-${column.key}`}
                          className="min-w-0"
                        >
                          <p className="text-compact-10 uppercase tracking-table-label text-white/45 sm:hidden light:text-app-fg-tertiary">
                            {column.label}
                          </p>
                          <TableCellValue
                            value={row[column.key]}
                            align={column.align}
                            className={column.className}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {isSelected && rowSelectedActions.length > 0 ? (
                    <div className="border-t border-white/8 bg-violet-500/10 px-3 py-2.5 light:border-app-border-subtle light:bg-amber-50/60">
                      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p
                          className="min-w-0 text-xs text-white/75 light:text-app-fg-muted"
                          title={rowSummary}
                        >
                          <span className="text-white/58 light:text-app-fg-subtle">
                            Selected:
                          </span>{" "}
                          <span className={TABLE_CELL_TRUNCATE_CLASS}>
                            {rowSummary}
                          </span>
                        </p>

                        <div className="flex min-w-0 max-w-full flex-wrap items-center justify-end gap-1.5">
                          {rowSelectedActions.map((action, actionIndex) => (
                            <button
                              key={`${title}-selected-action-${rowIndex}-${actionIndex}`}
                              type="button"
                              disabled={disableActions}
                              onClick={() => onActionClick?.(action.prompt)}
                              title={action.label}
                              className={cn(
                                "inline-flex h-7 max-w-44 min-w-0 shrink cursor-pointer items-center overflow-hidden rounded-md border px-2.5 text-compact-11 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
                                ACTION_TONE_CLASS[action.tone ?? "neutral"],
                              )}
                            >
                              <span className={TABLE_CELL_TRUNCATE_CLASS}>
                                {action.label}
                              </span>
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
          <div className="rounded-xl border border-white/8 bg-white/4 px-3 py-3 text-sm text-white/55 light:border-app-border-subtle light:bg-app-surface-subtle light:text-app-fg-subtle">
            {emptyLabel}
          </div>
        )}
      </div>
    </Card>
  );
}
