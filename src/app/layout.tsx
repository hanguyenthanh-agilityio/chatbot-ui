import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Time Off Agent",
  description:
    "A focused Next.js chat app for managing your own time off with OpenAI or Ollama.",
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
