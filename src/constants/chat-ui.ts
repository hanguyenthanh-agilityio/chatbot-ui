export const CHAT_TITLE = "AI SDK Core + UI Playground";
export const CHAT_SUBTITLE =
  "Default, tool, agent, multi-agent, MCP, and prompt chat modes with image generation and file-aware demos";
export const CHAT_PLACEHOLDER = "Ask a question (optionally attach files)...";
export const EMPTY_CHAT_HINT = "Ask something to start the chat.";
export const STREAMING_PLACEHOLDER_TEXT = "Working on your response...";
export const SUBMITTING_HINT = "Sending message...";
export const VERIFY_KEY_HINT =
  "Verify your OpenAI key before sending messages.";
export const VERIFY_PROVIDER_URL_HINT =
  "Verify your provider URL configuration before sending messages.";

export const PROVIDER_STATUS = {
  ollamaDefault: "Using Ollama.",
  ollamaSelected: "Ollama selected. Enter URL(s) and click Verify.",
  ollamaBaseUrlRequired: "Ollama base URL is required.",
  ollamaMcpUrlRequired: "MCP server URL is required for MCP mode.",
  verifyingOllamaUrls: "Verifying Ollama URL...",
  verifyingMcpServerUrl: "Verifying MCP server URL...",
  ollamaUrlsVerified: "Ollama URL verified. Using Ollama.",
  ollamaMcpUrlsVerified: "Ollama + MCP URLs verified. Using Ollama.",
  ollamaUrlInvalid: "Ollama/MCP URL verification failed.",
  openaiServerDefault: "Using OpenAI (default via server config).",
  openaiSelected: "OpenAI selected. Enter API key and click Verify.",
  openaiKeyRequired: "OpenAI key is required.",
  verifyingOpenAIKey: "Verifying OpenAI key with a 'hello' test...",
  openaiVerified: "OpenAI key verified. Using OpenAI.",
  openaiInvalidFallback: "OpenAI key can't use. Switched back to Ollama.",
} as const;
