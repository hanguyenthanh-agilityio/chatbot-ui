import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { ThemeProvider, useTheme } from "@/components/theme-provider";
import { DEFAULT_THEME, ThemeMode, type Theme } from "@/constants/theme";
import { persistTheme } from "@/lib/theme";

function ThemeProbe() {
  const { theme, setTheme, toggleTheme } = useTheme();
  return (
    <div data-testid="probe">
      <span data-testid="theme">{theme}</span>
      <button type="button" onClick={() => setTheme(ThemeMode.Light)}>
        set
      </button>
      <button type="button" onClick={toggleTheme}>
        toggle
      </button>
    </div>
  );
}

function renderWithDocumentTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  return render(
    <ThemeProvider>
      <ThemeProbe />
    </ThemeProvider>,
  );
}

describe("ThemeProvider", () => {
  afterEach(() => {
    cleanup();
    document.documentElement.dataset.theme = DEFAULT_THEME;
    document.documentElement.classList.remove("theme-switching");
    localStorage.clear();
  });

  beforeEach(() => {
    document.documentElement.dataset.theme = DEFAULT_THEME;
    localStorage.clear();
  });

  it.each([
    ["dark", ThemeMode.Dark],
    ["light", ThemeMode.Light],
  ] as const)("snapshot: %s", (_, theme) => {
    const { container } = renderWithDocumentTheme(theme);
    expect(container).toMatchSnapshot();
  });

  it.each([
    [ThemeMode.Dark, ThemeMode.Dark],
    [ThemeMode.Light, ThemeMode.Light],
    ["invalid", DEFAULT_THEME],
  ] as const)("logic: reads document theme (%s → %s)", (dataset, expected) => {
    document.documentElement.dataset.theme = dataset;
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("theme")).toHaveTextContent(expected);
  });

  // it("logic: SSR server snapshot uses default theme", () => {
  //   document.documentElement.dataset.theme = ThemeMode.Light;
  //   const html = renderToString(
  //     <ThemeProvider>
  //       <span>child</span>
  //     </ThemeProvider>,
  //   );
  //   expect(html).toContain("child");
  // });

  it("logic: updates after persistTheme (subscribe)", () => {
    renderWithDocumentTheme(DEFAULT_THEME);
    act(() => persistTheme(ThemeMode.Light));
    expect(screen.getByTestId("theme")).toHaveTextContent(ThemeMode.Light);
  });

  it("logic: setTheme", async () => {
    const user = userEvent.setup();
    renderWithDocumentTheme(ThemeMode.Dark);
    await user.click(screen.getByRole("button", { name: "set" }));
    expect(screen.getByTestId("theme")).toHaveTextContent(ThemeMode.Light);
  });

  it("logic: toggleTheme", async () => {
    const user = userEvent.setup();
    renderWithDocumentTheme(ThemeMode.Dark);
    await user.click(screen.getByRole("button", { name: "toggle" }));
    expect(screen.getByTestId("theme")).toHaveTextContent(ThemeMode.Light);
    await user.click(screen.getByRole("button", { name: "toggle" }));
    expect(screen.getByTestId("theme")).toHaveTextContent(ThemeMode.Dark);
  });
});

describe("useTheme", () => {
  afterEach(() => cleanup());

  it("logic: throws without provider", () => {
    function Orphan() {
      useTheme();
      return null;
    }
    expect(() => render(<Orphan />)).toThrow(
      "useTheme must be used within ThemeProvider",
    );
  });
});
