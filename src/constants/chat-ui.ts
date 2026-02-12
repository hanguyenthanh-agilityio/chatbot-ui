export const CHAT_TITLE = "Simple AI Chatbot";
export const CHAT_SUBTITLE = "Built with Next.js + AI SDK";
export const CHAT_PLACEHOLDER = "Say something...";
export const EMPTY_CHAT_HINT = "Ask something to start the chat.";
export const STREAMING_PLACEHOLDER_TEXT = "Working on your response...";
export const SUBMITTING_HINT = "Sending message...";
export const VERIFY_KEY_HINT = "Verify your OpenAI key before sending messages.";

export const PROVIDER_STATUS = {
  ollamaDefault: "Using Ollama (default).",
  openaiSelected: "OpenAI selected. Enter API key and click Verify.",
  openaiKeyRequired: "OpenAI key is required.",
  verifyingOpenAIKey: "Verifying OpenAI key with a 'hello' test...",
  openaiVerified: "OpenAI key verified. Using OpenAI.",
  openaiInvalidFallback: "OpenAI key can't use. Switched back to Ollama.",
} as const;
