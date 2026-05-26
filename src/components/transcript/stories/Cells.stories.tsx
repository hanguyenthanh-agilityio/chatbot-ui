import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { ToolOutputTableAction } from "@/components/chat/tool-output-table";
import { Badge } from "@/components/ui/badge";
import {
  buildSelfCancelPrompt,
  buildTeamActionPrompt,
  getSelfRequestRowActions,
  getTeamRequestRowActions,
  renderEmployeeCell,
  renderLeaveTypeChip,
  renderStatusChip,
} from "@/components/transcript/cells";
import { LEAVE_TYPE_LABEL_BY_TYPE } from "@/constants/leave";
import type { LeaveType } from "@/lib/db/schema";
import { inChatTranscript } from "@/mocks/storybook";
import {
  FIXTURE_REQUEST_FUTURE,
  FIXTURE_TEAM,
} from "@/mocks/time-off-fixtures";

const LEAVE_TYPES = Object.keys(LEAVE_TYPE_LABEL_BY_TYPE) as LeaveType[];
const STATUSES = ["approved", "pending", "rejected", "cancelled"] as const;
const VIEWS = [
  "chips",
  "employee",
  "self-actions",
  "team-actions",
  "prompt",
] as const;

type Args = {
  view: (typeof VIEWS)[number];
  employeeName: string;
  team: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  status: (typeof STATUSES)[number];
  showAllStatuses: boolean;
  promptKind: "self-cancel" | "team-approve" | "team-reject";
};

const empty = (
  <span className="text-sm text-white/45 light:text-app-fg-faint">—</span>
);

function Actions({ actions }: { actions: ToolOutputTableAction[] }) {
  if (!actions.length) return empty;
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((a) => (
        <Badge
          key={a.label}
          variant={
            a.tone === "danger"
              ? "danger"
              : a.tone === "success"
                ? "success"
                : "neutral"
          }
          className="px-2.5 py-0.5 text-xs"
        >
          {a.label}
        </Badge>
      ))}
    </div>
  );
}

function CellsPreview(args: Args) {
  const request = {
    employeeName: args.employeeName,
    team: args.team,
    leaveType: args.leaveType,
    leaveTypeLabel: LEAVE_TYPE_LABEL_BY_TYPE[args.leaveType],
    startDate: args.startDate,
    endDate: args.endDate,
    status: args.status,
  };

  switch (args.view) {
    case "chips":
      return (
        <div className="flex flex-wrap items-center gap-3">
          {renderLeaveTypeChip(request.leaveTypeLabel)}
          {args.showAllStatuses
            ? STATUSES.map((s) => <span key={s}>{renderStatusChip(s)}</span>)
            : renderStatusChip(args.status)}
        </div>
      );
    case "employee":
      return renderEmployeeCell(request);
    case "self-actions":
      return <Actions actions={getSelfRequestRowActions(request)} />;
    case "team-actions":
      return <Actions actions={getTeamRequestRowActions(request)} />;
    case "prompt": {
      const text =
        args.promptKind === "self-cancel"
          ? buildSelfCancelPrompt(request)
          : buildTeamActionPrompt(
              request,
              args.promptKind === "team-approve" ? "approve" : "reject",
            );
      return text ? (
        <p className="max-w-lg rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/75 light:border-app-border-subtle light:bg-app-surface-subtle light:text-app-fg-muted">
          {text}
        </p>
      ) : (
        empty
      );
    }
  }
}

const meta = {
  title: "Transcript/Cells",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Transcript table cells and row-action helpers. Use **view** to switch preview; request fields drive employee, actions, and prompts.",
      },
    },
  },
  decorators: [inChatTranscript],
  args: {
    view: "employee",
    employeeName: FIXTURE_REQUEST_FUTURE.employeeName,
    team: FIXTURE_TEAM,
    leaveType: "annual",
    startDate: FIXTURE_REQUEST_FUTURE.startDate,
    endDate: FIXTURE_REQUEST_FUTURE.endDate,
    status: "pending",
    showAllStatuses: false,
    promptKind: "self-cancel",
  },
  argTypes: {
    view: { control: "select", options: VIEWS, table: { category: "Preview" } },
    employeeName: { control: "text", table: { category: "Request" } },
    team: { control: "text", table: { category: "Request" } },
    leaveType: {
      control: "select",
      options: LEAVE_TYPES,
      table: { category: "Request" },
    },
    startDate: { control: "text", table: { category: "Request" } },
    endDate: { control: "text", table: { category: "Request" } },
    status: {
      control: "select",
      options: STATUSES,
      table: { category: "Request" },
    },
    showAllStatuses: {
      control: "boolean",
      table: { category: "Preview" },
    },
    promptKind: {
      control: "select",
      options: ["self-cancel", "team-approve", "team-reject"],
      table: { category: "Preview" },
    },
  },
  render: CellsPreview,
} satisfies Meta<Args>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Chips: Story = { args: { view: "chips" } };
export const EmployeeCell: Story = { args: { view: "employee" } };
export const Prompts: Story = { args: { view: "prompt" } };
