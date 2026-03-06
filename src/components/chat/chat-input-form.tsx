import {
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type FormEventHandler,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { CHAT_PLACEHOLDER } from "@/constants/chat-ui";
import { cn } from "@/utils/class-name";

type ChatInputFormProps = {
  input: string;
  canSend: boolean;
  isLoading: boolean;
  isOpenAIReady: boolean;
  attachedFiles: File[];
  onInputChange: (value: string) => void;
  onAddFiles: (files: FileList | null) => void;
  onRemoveAttachedFile: (index: number) => void;
  onClearAttachedFiles: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

export function ChatInputForm({
  input,
  canSend,
  isLoading,
  isOpenAIReady,
  attachedFiles,
  onInputChange,
  onAddFiles,
  onRemoveAttachedFile,
  onClearAttachedFiles,
  onSubmit,
}: ChatInputFormProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const dragDepthRef = useRef(0);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!menuContainerRef.current) return;

      if (!menuContainerRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  function openFilePicker() {
    setIsMenuOpen(false);
    fileInputRef.current?.click();
  }

  function handleDragEnter(event: DragEvent<HTMLFormElement>) {
    event.preventDefault();
    dragDepthRef.current += 1;
    setIsDragActive(true);
  }

  function handleDragLeave(event: DragEvent<HTMLFormElement>) {
    event.preventDefault();
    dragDepthRef.current -= 1;

    if (dragDepthRef.current <= 0) {
      dragDepthRef.current = 0;
      setIsDragActive(false);
    }
  }

  function handleDragOver(event: DragEvent<HTMLFormElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }

  function handleDrop(event: DragEvent<HTMLFormElement>) {
    event.preventDefault();
    dragDepthRef.current = 0;
    setIsDragActive(false);
    onAddFiles(event.dataTransfer.files);
  }

  return (
    <form
      onSubmit={onSubmit}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        "space-y-2 rounded-xl border border-transparent p-1 transition",
        isDragActive && "border-sky-400 bg-sky-50/40",
      )}
    >
      <div className="flex gap-2">
        <div className="relative" ref={menuContainerRef}>
          <Button
            type="button"
            size="md"
            variant="outline"
            aria-label="Open file actions"
            onClick={() => setIsMenuOpen((value) => !value)}
          >
            +
          </Button>

          {isMenuOpen ? (
            <div className="absolute bottom-12 left-0 z-20 w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
              <button
                type="button"
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                onClick={openFilePicker}
              >
                Add photos & files
              </button>
            </div>
          ) : null}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.docx,.txt,.md,.csv,.json"
            className="hidden"
            onChange={(event) => {
              onAddFiles(event.target.files);
              // Reset so re-selecting the same file still triggers onChange.
              event.currentTarget.value = "";
            }}
          />
        </div>

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
      </div>

      {isDragActive ? (
        <Text variant="caption" className="text-sky-700">
          Drop files here to attach
        </Text>
      ) : null}

      {attachedFiles.length > 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-2">
          <div className="flex flex-wrap gap-2">
            {attachedFiles.map((file, index) => (
              <span
                key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-50 px-2 py-1 text-xs text-slate-700"
              >
                {file.name}
                <button
                  type="button"
                  className="text-slate-500 hover:text-slate-900"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => onRemoveAttachedFile(index)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <button
            type="button"
            className="mt-2 text-xs text-slate-500 hover:text-slate-800"
            onClick={onClearAttachedFiles}
          >
            Clear attachments
          </button>
        </div>
      ) : (
        <Text variant="caption" className="text-slate-500">
          Click <strong>+</strong> to add files, or drag-and-drop into the input
          area.
        </Text>
      )}
    </form>
  );
}
