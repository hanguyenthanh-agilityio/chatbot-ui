import type { Metadata } from "next";
import {
  APP_METADATA_DESCRIPTION,
  APP_METADATA_TITLE,
} from "@/constants/app";
import "./globals.css";

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
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
