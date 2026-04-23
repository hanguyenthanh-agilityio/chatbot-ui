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
      <body className="antialiased">
        {/* Background blobs */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -left-24 -top-20 h-[500px] w-[500px] rounded-full bg-orange-500/15 blur-[75px]" />
          <div className="absolute -bottom-20 -left-20 h-[520px] w-[520px] rounded-full bg-purple-700/20 blur-[75px]" />
          <div className="absolute -right-28 top-1/4 h-[480px] w-[480px] rounded-full bg-cyan-600/12 blur-[75px]" />
        </div>
        {children}
      </body>
    </html>
  );
}
