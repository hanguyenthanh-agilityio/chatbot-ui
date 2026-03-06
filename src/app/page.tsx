import Link from "next/link";
import { PlaygroundNav } from "@/components/playground/playground-nav";
import { Text } from "@/components/ui/text";

const LAB_LINKS = [
  {
    href: "/chat",
    title: "Chat Lab",
    description:
      "AI SDK Core + UI chat playground with default/tool/agent/multi-agent/prompt/MCP modes and local chat history persistence.",
  },
  {
    href: "/image",
    title: "Image Lab",
    description:
      "Image-only generation flow. OpenAI supported, Ollama intentionally blocked for image in this project.",
  },
] as const;

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 p-4 sm:p-6">
      <PlaygroundNav />

      <header className="space-y-1">
        <Text as="h1" variant="title">
          AI SDK Playground Overview
        </Text>
        <Text variant="subtitle">
          Split by page as requested: chat and image labs.
        </Text>
      </header>

      <section className="grid gap-3">
        {LAB_LINKS.map((lab) => (
          <Link
            key={lab.href}
            href={lab.href}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300"
          >
            <Text as="h2" variant="body" className="font-semibold">
              {lab.title}
            </Text>
            <Text variant="caption" className="mt-1 block">
              {lab.description}
            </Text>
          </Link>
        ))}
      </section>
    </main>
  );
}
