import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AuthPanel } from "@/components/workspace/auth-panel";
import { AUTH_PANEL_COPY } from "@/constants/auth";
import { mockAuthSession } from "@/mocks/auth-panel";
import type { AppRole } from "@/lib/auth/session";
import type { ComponentProps } from "react";

type AuthPanelProps = ComponentProps<typeof AuthPanel>;

function mockAuthPanelProps(
  role: AppRole,
  overrides: Partial<AuthPanelProps> = {},
): AuthPanelProps {
  return {
    role,
    session: mockAuthSession(role, overrides.session),
    onRoleChange: vi.fn(),
    ...overrides,
  };
}

function renderAuthPanel(
  role: AppRole = "user",
  overrides: Partial<AuthPanelProps> = {},
) {
  return render(<AuthPanel {...mockAuthPanelProps(role, overrides)} />);
}

describe("AuthPanel", () => {
  afterEach(() => {
    cleanup();
  });

  it.each([
    ["user", "user" as const, {}],
    ["manager", "manager" as const, {}],
    ["disabled", "user" as const, { disabled: true }],
  ])("snapshot %s", (_id, role, overrides) => {
    const { container } = renderAuthPanel(role, overrides);
    expect(container.firstElementChild?.outerHTML ?? "").toMatchSnapshot();
  });

  it("calls onRoleChange when a valid role is selected", async () => {
    const user = userEvent.setup();
    const onRoleChange = vi.fn();
    renderAuthPanel("user", { onRoleChange });

    await user.selectOptions(screen.getByRole("combobox"), "manager");

    expect(onRoleChange).toHaveBeenCalledTimes(1);
    expect(onRoleChange).toHaveBeenCalledWith("manager");
  });

  it("ignores invalid role values from the select", () => {
    const onRoleChange = vi.fn();
    renderAuthPanel("user", { onRoleChange });

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "admin" },
    });

    expect(onRoleChange).not.toHaveBeenCalled();
  });

  it("shows direct reports for manager sessions", () => {
    renderAuthPanel("manager");
    expect(
      screen.getByText(new RegExp(AUTH_PANEL_COPY.directReportsLabel)),
    ).toBeInTheDocument();
    expect(screen.getByText(/Mia Nguyen/)).toBeInTheDocument();
  });

  it("hides direct reports for user sessions", () => {
    renderAuthPanel("user");
    expect(
      screen.queryByText(new RegExp(AUTH_PANEL_COPY.directReportsLabel)),
    ).not.toBeInTheDocument();
  });
});
