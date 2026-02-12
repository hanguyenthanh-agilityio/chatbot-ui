import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Simple AI Chatbot",
  description: "A minimal chatbot built with Next.js and the AI SDK.",
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
