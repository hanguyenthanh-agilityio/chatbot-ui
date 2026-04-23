import type { ReactNode } from "react";
import { cn } from "@/utils/class-name";

export type ToolOutputTableColumn = {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  className?: string;
};

export type ToolOutputTableRow = Record<string, ReactNode>;

type ToolOutputTableProps = {
  title: string;
  columns: ToolOutputTableColumn[];
  rows: ToolOutputTableRow[];
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

  if (keySignature === "employee|leaveType|dateRange|days|status") {
    return "gap-x-5";
  }

  if (keySignature === "leaveType|dateRange|days|status") {
    return "gap-x-3";
  }

  return "gap-x-3";
}

export function ToolOutputTable({
  title,
  columns,
  rows,
  emptyLabel = "No records found.",
}: ToolOutputTableProps) {
  const recordCount = rows.length;
  const desktopTemplateClass = getDesktopTemplateClass(columns);
  const gridClassName = cn(
    "grid",
    getGridGapClass(columns),
    getGridClass(columns.length),
    desktopTemplateClass,
  );

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

            {rows.map((row, rowIndex) => (
              <div
                key={`${title}-${rowIndex}`}
                className={cn(
                  "px-3 py-2.5",
                  rowIndex > 0 && "border-t border-white/[.07]",
                  rowIndex % 2 === 0 ? "bg-white/[.01]" : "bg-white/[.025]",
                )}
              >
                <div className={cn(gridClassName, "items-center gap-y-1.5")}>
                  {columns.map((column) => (
                    <div
                      key={`${rowIndex}-${column.key}`}
                      className="min-w-0"
                    >
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
            ))}
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
