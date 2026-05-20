import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthPanel } from "@/components/workspace/auth-panel";
import { AUTH_PANEL_COPY } from "@/constants/auth";
import { mockAuthSession } from "@/mocks/auth-panel";

describe("AuthPanel", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders title, mode label, and session fields for user role", () => {
    const session = mockAuthSession("user");
    render(
      <AuthPanel
        role="user"
        session={session}
        onRoleChange={vi.fn()}
      />,
    );

    expect(screen.getByText(AUTH_PANEL_COPY.title)).toBeInTheDocument();
    expect(screen.getByText(AUTH_PANEL_COPY.modeLabel)).toBeInTheDocument();
    expect(screen.getByText(session.name)).toBeInTheDocument();
    expect(
      screen.getByText(`${AUTH_PANEL_COPY.emailLabel}: ${session.email}`),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`${AUTH_PANEL_COPY.projectLabel}: ${session.team}`),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        `${AUTH_PANEL_COPY.managerLabelPrefix}: ${session.manager}`,
      ),
    ).toBeInTheDocument();
  });

  it("does not show direct reports block when session role is user", () => {
    render(
      <AuthPanel
        role="user"
        session={mockAuthSession("user")}
        onRoleChange={vi.fn()}
      />,
    );
    expect(
      screen.queryByText(`${AUTH_PANEL_COPY.directReportsLabel}:`),
    ).not.toBeInTheDocument();
  });

  it("shows direct reports when session role is manager", () => {
    const session = mockAuthSession("manager");
    render(
      <AuthPanel
        role="manager"
        session={session}
        onRoleChange={vi.fn()}
      />,
    );
    expect(
      screen.getByText(`${AUTH_PANEL_COPY.directReportsLabel}:`),
    ).toBeInTheDocument();
    for (const employee of session.managedEmployees) {
      expect(screen.getByText(`- ${employee.name}`)).toBeInTheDocument();
    }
  });

  it("calls onRoleChange when select value changes", async () => {
    const user = userEvent.setup();
    const onRoleChange = vi.fn();
    render(
      <AuthPanel
        role="user"
        session={mockAuthSession("user")}
        onRoleChange={onRoleChange}
      />,
    );

    await user.selectOptions(
      screen.getByRole("combobox"),
      "manager",
    );
    expect(onRoleChange).toHaveBeenCalledTimes(1);
    expect(onRoleChange).toHaveBeenCalledWith("manager");
  });

  it("disables the role select when disabled is true", () => {
    render(
      <AuthPanel
        role="user"
        session={mockAuthSession("user")}
        disabled
        onRoleChange={vi.fn()}
      />,
    );
    expect(screen.getByRole("combobox")).toBeDisabled();
  });
});
