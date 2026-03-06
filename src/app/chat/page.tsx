import { ChatPlayground } from "@/components/chat/chat-playground";
import { PlaygroundNav } from "@/components/playground/playground-nav";

export default function ChatPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 p-4 sm:p-6">
      <PlaygroundNav />
      <ChatPlayground />
    </main>
  );
}
