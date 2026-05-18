import "@/app/globals.css";

import type { Preview } from "@storybook/nextjs-vite";
import { DEFAULT_THEME } from "@/constants/theme";
import { withAppTheme } from "./with-app-theme";

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "App light / dark mode",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "dark", title: "Dark", icon: "moon" },
          { value: "light", title: "Light", icon: "sun" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: DEFAULT_THEME,
  },
  parameters: {
    layout: "centered",
  },
  decorators: [withAppTheme],
};

export default preview;
