import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Badge } from "@/components/ui/badge";

describe("Badge", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders label text", () => {
    render(<Badge>OLLAMA</Badge>);
    expect(screen.getByText("OLLAMA")).toBeInTheDocument();
  });

  it("uses neutral variant and md size by default", () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText("Default");
    expect(badge).toHaveClass("app-badge-neutral");
    expect(badge.tagName).toBe("SPAN");
  });

  it("applies variant hook class", () => {
    render(<Badge variant="brand">Review first</Badge>);
    expect(screen.getByText("Review first")).toHaveClass("app-badge-brand");
  });

  it("applies provider variant from constants", () => {
    render(<Badge variant="providerOllama">ollama</Badge>);
    expect(screen.getByText("ollama")).toHaveClass("app-badge-provider-ollama");
  });

  it("applies size classes", () => {
    render(
      <Badge size="sm" variant="info">
        Small
      </Badge>,
    );
    expect(screen.getByText("Small")).toHaveClass("text-[10px]");
  });

  it("merges custom className", () => {
    render(
      <Badge className="uppercase tracking-wide" variant="success">
        OK
      </Badge>,
    );
    const badge = screen.getByText("OK");
    expect(badge).toHaveClass("uppercase", "tracking-wide");
  });
});
