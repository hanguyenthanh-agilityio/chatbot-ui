import type { Metadata } from "next";
import Script from "next/script";

// Constants
import { APP_METADATA_DESCRIPTION, APP_METADATA_TITLE } from "@/constants/app";
import { DEFAULT_THEME } from "@/constants/theme";

// Components
import { ThemeProvider } from "@/components/theme-provider";

// Styles
import "./globals.css";

// Lib
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import { cn } from "@/utils/class-name";

export const metadata: Metadata = {
  title: APP_METADATA_TITLE,
  description: APP_METADATA_DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme={DEFAULT_THEME} suppressHydrationWarning>
      <body className="antialiased">
        {/* Inline script: avoid flash of wrong theme on first load. */}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
        <div
          className="pointer-events-none fixed inset-0 overflow-hidden"
          aria-hidden="true"
        >
          <div
            className={cn(
              "absolute -left-28 -top-24 size-app-blob rounded-full blur-app-blob",
              "bg-violet-500/14 light:bg-app-blob-violet",
            )}
          />
          <div
            className={cn(
              "absolute -bottom-24 -left-16 size-app-blob-alt rounded-full blur-app-blob",
              "bg-indigo-600/16 light:bg-app-blob-indigo",
            )}
          />
          <div
            className={cn(
              "absolute -right-24 top-1/4 size-app-blob rounded-full blur-app-blob-accent",
              "bg-cyan-500/12 light:bg-app-blob-cyan",
            )}
          />
        </div>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
