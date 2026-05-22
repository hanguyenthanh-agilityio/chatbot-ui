import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

// Components
import { Text } from "@/components/ui/text";

// Constants
import { TEXT_VARIANT_OPTIONS } from "@/constants/text";

describe("Text", () => {
  afterEach(() => {
    cleanup();
  });

  it.each(
    TEXT_VARIANT_OPTIONS.map(
      (variant) => [variant, { children: "Sample", variant }] as const,
    ),
  )("matches snapshot (%s)", (_name, props) => {
    render(<Text {...props} />);
    expect(screen.getByText("Sample").outerHTML).toMatchSnapshot();
  });

  it.each([
    [
      "as-h2",
      { as: "h2" as const, variant: "title" as const, children: "Heading" },
    ],
    [
      "custom-class",
      {
        children: "Styled",
        variant: "body" as const,
        className: "text-center uppercase",
      },
    ],
  ] as const)("matches snapshot (%s)", (_name, props) => {
    render(<Text {...props} />);
    expect(
      screen.getByText(String(props.children)).outerHTML,
    ).toMatchSnapshot();
  });
});
