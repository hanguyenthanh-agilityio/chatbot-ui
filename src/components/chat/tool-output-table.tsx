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
  center: "text-center",
  right: "text-right",
};

function getAlignClass(align?: ToolOutputTableColumn["align"]) {
  return TEXT_ALIGN_CLASS[align ?? "left"];
}

function getGridClass(columnCount: number) {
  if (columnCount <= 1) return "grid-cols-1";
  if (columnCount === 2) return "grid-cols-1 sm:grid-cols-2";
  if (columnCount === 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  if (columnCount === 4) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
  return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5";
}

function getCellSpanClass(
  column: ToolOutputTableColumn,
  columnIndex: number,
  columnCount: number,
) {
  if (columnIndex !== 0 || column.key !== "employee") return "";
  return columnCount >= 4 ? "sm:col-span-2" : "";
}

export function ToolOutputTable({
  title,
  columns,
  rows,
  emptyLabel = "No records found.",
}: ToolOutputTableProps) {
  const recordCount = rows.length;

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(140deg,rgba(255,255,255,.08),rgba(255,255,255,.03))] backdrop-blur-md shadow-[0_8px_28px_rgba(0,0,0,0.28)]">
      <div className="flex items-center justify-between gap-2 border-b border-white/[.08] px-3 py-2.5">
        <p className="font-syne text-[11px] font-semibold uppercase tracking-[0.16em] text-white/75">
          {title}
        </p>
        <span className="rounded-full border border-white/15 bg-white/[.06] px-2 py-0.5 text-[10px] font-medium text-white/55">
          {recordCount} {recordCount === 1 ? "record" : "records"}
        </span>
      </div>

      <div className="space-y-2 p-2.5">
        {rows.length > 0 ? (
          rows.map((row, rowIndex) => (
            <article
              key={`${title}-${rowIndex}`}
              className="rounded-xl border border-white/[.09] bg-[#1a1834]/55 px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
            >
              <div className={cn("grid gap-3", getGridClass(columns.length))}>
                {columns.map((column, columnIndex) => (
                  <div
                    key={`${rowIndex}-${column.key}`}
                    className={cn(
                      "min-w-0",
                      getCellSpanClass(column, columnIndex, columns.length),
                    )}
                  >
                    <p className="font-dm-sans text-[10px] uppercase tracking-[0.14em] text-white/45">
                      {column.label}
                    </p>
                    <div
                      className={cn(
                        "mt-1 font-dm-sans text-sm leading-relaxed text-white/88 break-words",
                        getAlignClass(column.align),
                        column.className,
                      )}
                    >
                      {row[column.key] ?? "—"}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-xl border border-white/[.08] bg-white/[.04] px-3 py-3 text-sm text-white/55">
            {emptyLabel}
          </div>
        )}
      </div>
    </section>
  );
}
