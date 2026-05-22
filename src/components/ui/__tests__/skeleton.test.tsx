import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Skeleton } from "@/components/ui/skeleton";

describe("Skeleton", () => {
  afterEach(() => {
    cleanup();
  });

  it.each([
    ["default", {}],
    ["custom-size", { className: "h-4 w-32 rounded-full" }],
  ] as const)("snapshot: %s", (_name, props) => {
    const { container } = render(<Skeleton {...props} />);
    expect(container.firstElementChild?.outerHTML ?? "").toMatchSnapshot();
  });
});
