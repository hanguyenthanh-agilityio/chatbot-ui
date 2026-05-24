import { describe, expect, it } from 'vitest';

import {
  buildMembersTableModel,
  getBalanceTableModel,
  getRequestTableModel,
} from '@/components/transcript/named-tables';
import {
  getBalanceRowActions,
  getSelfRequestRowActions,
} from '@/components/transcript/cells';

describe('transcript/named-tables', () => {
  it('builds members table with row actions', () => {
    const model = buildMembersTableModel({
      id: 'team-members',
      title: 'Team members',
      memberRows: [
        {
          employeeName: 'Mia Nguyen',
          pendingCount: 1,
          approvedCount: 2,
          cancelledCount: 0,
          totalCount: 3,
        },
      ],
      emptyLabel: 'No team members found.',
    });

    expect(model?.columns).toHaveLength(5);
    expect(model?.rowActions?.[0]?.[0]?.label).toBe('View pending');
  });

  it('builds request table with and without employee column', () => {
    const selfModel = getRequestTableModel({
      id: 'my-requests',
      title: 'My requests',
      payload: {
        requests: [
          {
            leaveType: 'annual',
            startDate: '2026-06-10',
            endDate: '2026-06-12',
            days: 3,
            status: 'pending',
          },
        ],
      },
      showEmployee: false,
      getRowActions: getSelfRequestRowActions,
      emptyLabel: 'No requests.',
    });

    const teamModel = getRequestTableModel({
      id: 'team-requests',
      title: 'Team requests',
      payload: {
        requests: [
          {
            employeeName: 'Mia Nguyen',
            leaveType: 'sick',
            startDate: '2026-07-01',
            endDate: '2026-07-01',
            days: 1,
            status: 'approved',
          },
        ],
      },
      showEmployee: true,
      emptyLabel: 'No team requests.',
    });

    expect(selfModel?.columns.some((column) => column.key === 'employee')).toBe(
      false,
    );
    expect(teamModel?.columns.some((column) => column.key === 'employee')).toBe(
      true,
    );
  });

  it('builds balance table with row actions', () => {
    const model = getBalanceTableModel({
      id: 'balance',
      title: 'My leave balance',
      payload: {
        balances: [
          {
            leaveType: 'annual',
            allowance: 14,
            used: 2,
            pending: 1,
            remaining: 11,
          },
        ],
      },
      getRowActions: getBalanceRowActions,
      emptyLabel: 'No balance data found.',
    });

    expect(model?.rows).toHaveLength(1);
    expect(model?.rowActions?.[0]?.[0]?.prompt).toContain('annual');
  });

  it('returns null when payload shape is invalid', () => {
    expect(
      getRequestTableModel({
        id: 'x',
        title: 'X',
        payload: {},
        showEmployee: false,
        emptyLabel: 'Empty',
      }),
    ).toBeNull();

    expect(
      getBalanceTableModel({
        id: 'x',
        title: 'X',
        payload: {},
        emptyLabel: 'Empty',
      }),
    ).toBeNull();
  });
});
