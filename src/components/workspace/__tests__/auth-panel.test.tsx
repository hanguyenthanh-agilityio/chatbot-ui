import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

// Components
import { AuthPanel } from "@/components/workspace/auth-panel";

// Mocks
import { mockAuthSession } from "@/mocks/auth-panel";

describe("AuthPanel", () => {
  afterEach(() => {
    cleanup();
  });

  it("matches snapshot (user session)", () => {
    const { container } = render(
      <AuthPanel
        role="user"
        session={mockAuthSession("user")}
        onRoleChange={vi.fn()}
      />,
    );
    expect(container.firstElementChild?.outerHTML ?? "").toMatchSnapshot();
  });

  it("matches snapshot (manager session)", () => {
    const { container } = render(
      <AuthPanel
        role="manager"
        session={mockAuthSession("manager")}
        onRoleChange={vi.fn()}
      />,
    );
    expect(container.firstElementChild?.outerHTML ?? "").toMatchSnapshot();
  });

  it("matches snapshot (disabled select)", () => {
    const { container } = render(
      <AuthPanel
        role="user"
        session={mockAuthSession("user")}
        disabled
        onRoleChange={vi.fn()}
      />,
    );
    expect(container.firstElementChild?.outerHTML ?? "").toMatchSnapshot();
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

    await user.selectOptions(screen.getByRole("combobox"), "manager");
    expect(onRoleChange).toHaveBeenCalledTimes(1);
    expect(onRoleChange).toHaveBeenCalledWith("manager");
  });
});
