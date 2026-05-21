import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Badge, type BadgeProps } from "@/components/ui/badge";

describe("Badge", () => {
  afterEach(() => {
    cleanup();
  });

  it.each([
    ["default", { children: "Default" }],
    ["brand", { children: "Review first", variant: "brand" as const }],
    [
      "providerOllama",
      { children: "ollama", variant: "providerOllama" as const },
    ],
    [
      "sm-info",
      { children: "Small", size: "sm" as const, variant: "info" as const },
    ],
    [
      "custom-class",
      {
        children: "OK",
        variant: "success" as const,
        className: "uppercase tracking-wide",
      },
    ],
  ] as const satisfies ReadonlyArray<[string, BadgeProps]>)(
    "matches snapshot (%s)",
    (_name, props) => {
      render(<Badge {...props} />);
      expect(
        screen.getByText(String(props.children)).outerHTML,
      ).toMatchSnapshot();
    },
  );
});
