import type { AppRole } from "@/lib/auth/session";

export const APP_TITLE = "Time Off Agent";
export const CHAT_PLACEHOLDER =
  "Ask about your balance, request time off, review approvals, or cancel a request...";
export const STREAMING_PLACEHOLDER_TEXT = "Working on it...";
export const SUBMITTING_HINT = "Sending your message...";
export const VERIFY_KEY_HINT =
  "Verify your OpenAI key before sending messages.";
export const VERIFY_PROVIDER_URL_HINT =
  "Verify your Ollama URL before sending messages.";

export const APP_SUBTITLE_BY_ROLE: Record<AppRole, string> = {
  user:
    "Review balances and upcoming requests first, then confirm leave changes safely when you're ready.",
  manager:
    "Review the team's leave queue first, then approve or reject safely with a quick confirmation step.",
};

export const EMPTY_HEADER_TITLE_BY_ROLE: Record<AppRole, string> = {
  user: "Plan your time off with confidence",
  manager: "Review team leave with confidence",
};

export const EMPTY_HEADER_HINT_BY_ROLE: Record<AppRole, string> = {
  user: "Start by reviewing your balance or upcoming requests.",
  manager: "Start by reviewing pending requests before taking action.",
};

export const QUICK_ACTIONS_BY_ROLE: Record<
  AppRole,
  Array<{ label: string; prompt: string }>
> = {
  user: [
    {
      label: "Check balance",
      prompt:
        "How many annual, sick, and personal leave days do I have left?",
    },
    {
      label: "Review pending",
      prompt: "List my pending and upcoming time-off requests first.",
    },
    {
      label: "Draft annual leave",
      prompt:
        "I want annual leave from 2026-05-04 to 2026-05-05 for a family trip. Please review my balance and upcoming requests first.",
    },
    {
      label: "Review before cancel",
      prompt: "Show my cancellable requests first so I can choose one to cancel.",
    },
  ],
  manager: [
    {
      label: "Team pending",
      prompt: "Show my team's pending time-off requests.",
    },
    {
      label: "Review Mia request",
      prompt:
        "Show Mia Nguyen's pending team time-off requests first.",
    },
    {
      label: "Approve after review",
      prompt:
        "Review my team's pending requests, then help me approve the right one with comment: Approved. Please keep handover notes updated.",
    },
    {
      label: "Reject after review",
      prompt:
        "Review my team's pending requests, then help me reject An Pham's request with comment: We need sprint coverage on that day.",
    },
  ],
};

export const ROLE_HELPER_COPY: Record<AppRole, string> = {
  user:
    "User mode routes to the Time Off Agent for your personal leave requests and balance checks.",
  manager:
    "Manager mode unlocks team approval workflows while still supporting personal leave questions.",
};

export const PROVIDER_STATUS = {
  ollamaDefault: "Using Ollama with local/default config.",
  ollamaCustomUrl:
    "Custom Ollama URL set. You can verify it before chatting.",
  ollamaSelected: "Ollama selected. Enter a URL and verify it to continue.",
  ollamaBaseUrlRequired: "Ollama base URL is required.",
  verifyingOllamaUrl: "Verifying Ollama URL...",
  ollamaVerified: "Ollama URL verified.",
  ollamaUrlInvalid: "Could not verify the Ollama URL.",
  openaiServerDefault: "Using OpenAI from server configuration.",
  openaiSelected: "OpenAI selected. Enter your API key and verify it.",
  openaiKeyRequired: "OpenAI API key is required.",
  verifyingOpenAIKey: "Verifying OpenAI API key...",
  openaiVerified: "OpenAI API key verified.",
  openaiInvalid: "Could not verify the OpenAI API key.",
} as const;

export function getAppSubtitle(role: AppRole) {
  return APP_SUBTITLE_BY_ROLE[role];
}

export function getQuickActions(role: AppRole) {
  return QUICK_ACTIONS_BY_ROLE[role];
}

export function getEmptyHeaderTitle(role: AppRole) {
  return EMPTY_HEADER_TITLE_BY_ROLE[role];
}

export function getEmptyHeaderHint(role: AppRole) {
  return EMPTY_HEADER_HINT_BY_ROLE[role];
}
