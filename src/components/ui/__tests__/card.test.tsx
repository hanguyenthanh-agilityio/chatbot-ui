import { cleanup, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

// Components
import { Card, CardContent, CardHeader } from "@/components/ui/card";

describe("Card", () => {
  afterEach(() => {
    cleanup();
  });

  it.each([
    ["glass-default", {}],
    ["panel", { variant: "panel" as const }],
    ["soft", { variant: "soft" as const }],
    ["success", { variant: "success" as const }],
    ["danger", { variant: "danger" as const }],
    ["custom-class", { className: "mt-2 w-full" }],
  ])("matches snapshot (%s)", (_name, props) => {
    const { container } = render(<Card {...props}>Content</Card>);
    expect(container).toMatchSnapshot();
  });

  it("matches snapshot with header and content", () => {
    const { container } = render(
      <Card variant="panel">
        <CardHeader>Title</CardHeader>
        <CardContent>Body</CardContent>
      </Card>,
    );
    expect(container).toMatchSnapshot();
  });

  it("forwards onClick on the root div", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { container } = render(<Card onClick={onClick}>Clickable</Card>);
    await user.click(container.firstElementChild as HTMLElement);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
