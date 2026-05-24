import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ToolOutputTable } from "@/components/chat/tool-output-table";
import {
  collectRecordCollections,
  getCollectionId,
  getCollectionTitle,
  getGenericTableModel,
  toHumanLabel,
  toKebabCase,
} from "@/components/transcript/generic-table";

const sampleRows = [
  {
    employeeName: "Mia Nguyen",
    team: "Flash",
    leaveTypeLabel: "Annual leave",
    startDate: "2026-06-10",
    endDate: "2026-06-12",
    status: "pending",
  },
];

describe("transcript/generic-table", () => {
  afterEach(() => cleanup());

  it("snapshot: generic table", () => {
    const model = getGenericTableModel({
      id: "records",
      title: "Records",
      rows: sampleRows,
      emptyLabel: "No records found.",
    });

    const { container } = render(
      <ToolOutputTable
        title={model!.title}
        columns={model!.columns}
        rows={model!.rows}
        emptyLabel={model!.emptyLabel}
      />,
    );

    expect(container.firstElementChild?.outerHTML ?? "").toMatchSnapshot();
  });

  it("formats labels and discovers collections", () => {
    expect(toKebabCase("teamRequests")).toBe("team-requests");
    expect(toHumanLabel("employeeId")).toBe("Employee ID");
    expect(toHumanLabel("")).toBe("Records");

    const collections = collectRecordCollections({
      team: { requests: [{ id: "1", status: "pending" }] },
    });
    expect(collections[0]?.path).toEqual(["team", "requests"]);

    expect(getCollectionTitle(["team", "requests"], null)).toBe("Team requests");
    expect(getCollectionTitle(["upcoming", "requests"], null)).toBe("Upcoming requests");
    expect(getCollectionTitle(["team", "items"], null)).toBe("Team");
    expect(getCollectionTitle([], "get_my_time_off_balance")).toBe("My leave balance");
    expect(getCollectionTitle(["balances"], null)).toBe("Leave balance");
    expect(getCollectionId(["team", "requests"], null)).toBe("team-requests");
    expect(getCollectionId([], null)).toBe("records");
  });

  it("covers empty inputs and alternate column shapes", () => {
    expect(
      getGenericTableModel({
        id: "empty",
        title: "Empty",
        rows: [],
        emptyLabel: "No records.",
      }),
    ).toBeNull();

    expect(collectRecordCollections(null)).toEqual([]);
    expect(collectRecordCollections([1, 2])).toEqual([]);
    expect(collectRecordCollections("invalid")).toEqual([]);

    expect(
      getGenericTableModel({
        id: "skip",
        title: "Skip",
        rows: [{ meta: { nested: true } }],
        emptyLabel: "No records.",
      }),
    ).toBeNull();

    const model = getGenericTableModel({
      id: "alt",
      title: "Alt",
      rows: [
        {
          leaveType: "annual",
          dateRange: "Jun 10–12, 2026",
          days: 3,
          status: "approved",
          hidden: { nested: true },
        },
      ],
      emptyLabel: "No records.",
    });

    expect(model?.columns.map((column) => column.key)).toEqual(
      expect.arrayContaining(["leaveType", "dateRange", "days", "status"]),
    );
    expect(model?.rows[0]?.dateRange).toBe("Jun 10–12, 2026");
  });
});
