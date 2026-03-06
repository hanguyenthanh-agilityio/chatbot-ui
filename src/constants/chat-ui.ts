export const CHAT_TITLE = "AI SDK Core + UI Playground";
export const CHAT_SUBTITLE =
  "Default, tool, agent, multi-agent, MCP, and prompt chat modes with image generation and file-aware demos";
export const CHAT_PLACEHOLDER = "Ask a question (optionally attach files)...";
export const EMPTY_CHAT_HINT = "Ask something to start the chat.";
export const STREAMING_PLACEHOLDER_TEXT = "Working on your response...";
export const SUBMITTING_HINT = "Sending message...";
export const VERIFY_KEY_HINT =
  "Verify your OpenAI key before sending messages.";

export const PROVIDER_STATUS = {
  ollamaDefault: "Using Ollama (default).",
  openaiSelected: "OpenAI selected. Enter API key and click Verify.",
  openaiKeyRequired: "OpenAI key is required.",
  verifyingOpenAIKey: "Verifying OpenAI key with a 'hello' test...",
  openaiVerified: "OpenAI key verified. Using OpenAI.",
  openaiInvalidFallback: "OpenAI key can't use. Switched back to Ollama.",
} as const;
