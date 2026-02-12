import type { FormEventHandler } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CHAT_PLACEHOLDER } from "@/constants/chat-ui";

type ChatInputFormProps = {
  input: string;
  canSend: boolean;
  isLoading: boolean;
  isOpenAIReady: boolean;
  onInputChange: (value: string) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

export function ChatInputForm({
  input,
  canSend,
  isLoading,
  isOpenAIReady,
  onInputChange,
  onSubmit,
}: ChatInputFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <Input
        value={input}
        onChange={(event) => onInputChange(event.target.value)}
        placeholder={CHAT_PLACEHOLDER}
        aria-label="Chat input"
        fullWidth
        controlSize="md"
        variant="default"
        className="flex-1"
      />
      <Button
        type="submit"
        disabled={!canSend}
        aria-label="Send message"
        variant="primary"
        size="md"
      >
        {!isOpenAIReady
          ? "Verify key first"
          : isLoading
            ? "Generating..."
            : "Send"}
      </Button>
    </form>
  );
}
