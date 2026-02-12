# Simple AI Chatbot

Clean, minimal chatbot built with Next.js + AI SDK.

## Stack

- Next.js (App Router)
- AI SDK: `ai`, `@ai-sdk/react`
- OpenAI-compatible provider client: `@ai-sdk/openai`
- Providers: `ollama` (default), `openai`

## Quick Start

1. Install dependencies

```bash
pnpm install
```

2. Create env file

```bash
cp .env.example .env.local
```

3. (Recommended for local free mode) pull Ollama model

```bash
pnpm run ollama:pull
```

4. Start app

```bash
pnpm run dev
```

Open the URL printed by Next.js (`http://localhost:3000` by default).

## Environment

Default `.env.example` uses Ollama:

```env
AI_PROVIDER=ollama
AI_MODEL=qwen2.5:3b
OPENAI_API_KEY=ollama
OPENAI_BASE_URL=http://localhost:11434/v1
```

Optional OpenAI mode (if needed):

```env
AI_PROVIDER=openai
AI_MODEL=gpt-4o-mini
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1
```

## Provider Behavior (UI)

- Default provider is `Ollama`.
- When user selects `OpenAI`, user must input API key.
- App validates key with a lightweight `hello` request.
- If key is invalid/unusable, UI shows message and auto-switches back to `Ollama`.

## Clean Project Structure

```text
src/
  app/
    api/
      chat/route.ts
      validate-openai-key/route.ts
    page.tsx
  components/
    chat/
      chat-input-form.tsx
      chat-messages.tsx
      loading-bubble.tsx
      message-bubble.tsx
      provider-selector.tsx
    ui/
      button.tsx
      input.tsx
      select.tsx
      text.tsx
  constants/
    chat-ui.ts
  hooks/
    use-chat-auto-scroll.ts
    use-provider-selection.ts
  lib/
    ai-provider.ts
  utils/
    chat-message.ts
    class-name.ts
    error-message.ts
```

## Scripts

- `pnpm run dev`: run web + Ollama service together
- `pnpm run dev:web`: run Next.js only
- `pnpm run dev:ollama`: start Ollama only if not running
- `pnpm run ollama:pull`: pull default local model
- `pnpm run lint`: lint
- `pnpm run build`: production build

## Notes

- This project is organized into reusable layers: `components`, `hooks`, `constants`, `utils`.
- UI primitives support variants and are ready for reuse:
  - `Text`
  - `Button`
  - `Input`
  - `Select`

## More Templates

- Vercel AI templates: https://vercel.com/templates/ai
