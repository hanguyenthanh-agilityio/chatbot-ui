import { describe, expect, it } from "vitest";

import { ThemeMode } from "@/constants/theme";
import { isTheme } from "@/lib/theme";

describe("isTheme", () => {
  it.each([
    [ThemeMode.Dark, true],
    [ThemeMode.Light, true],
    ["", false],
    [null, false],
    [undefined, false],
    ["system", false],
  ] as const)("narrows %j to Theme (%s)", (value, expected) => {
    expect(isTheme(value)).toBe(expected);
  });
});
