# Time Off Agent (Next.js)

Focused Next.js chat app for **personal time-off management**.

## What remains in this repo

- Time-off chat only
- Provider selector: **OpenAI** or **Ollama**
- ChatGPT-like UI with:
  - sidebar thread list
  - main transcript area
  - sticky composer
- Time-off agent tools for:
  - checking balance
  - listing requests
  - creating requests
  - cancelling requests

## Stack

- Next.js App Router
- AI SDK: `ai`, `@ai-sdk/react`
- Providers:
  - `@ai-sdk/openai`
  - Ollama via OpenAI-compatible endpoint
- Validation: `zod`
- JSON data server: `json-server` with local file in `server/db/manager-db.json`

## Routes

- `/` main time-off chat app
- `/api/chat` time-off agent chat route
- `/api/validate-openai-key` verify OpenAI API key
- `/api/validate-ollama-url` verify Ollama URL

## Quick start

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open: `http://localhost:3000`

## Environment

### Local Ollama default

```env
AI_PROVIDER=ollama
AI_MODEL=qwen2.5:3b
OLLAMA_MODEL=qwen2.5:3b
OPENAI_API_KEY=ollama
OPENAI_BASE_URL=http://localhost:11434/v1
```

### Optional OpenAI

```env
AI_PROVIDER=openai
AI_MODEL=gpt-4o-mini
OPENAI_MODEL=gpt-4o-mini
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1
NEXT_PUBLIC_OPENAI_SERVER_READY=true
```

## Notes

- All manager/time-off data lives in `server/db/manager-db.json`.
- Seed data is in `server/db/manager-db.seed.json`.
- App tools read/update data through the JSON server HTTP API (`MANAGER_DB_BASE_URL`, default `http://127.0.0.1:4100`).
- Use `pnpm run manager-db:reset` to restore seeded database state.
- If Next dev shows stale Turbopack cache errors, remove `.next` and rerun `pnpm dev`.

## Scripts

- `pnpm run dev:web`: run Next.js only
- `pnpm run dev:manager-db`: run json-server data API on port `4100`
- `pnpm run dev:ollama`: start Ollama if it is installed and not already running
- `pnpm run manager-db:reset`: reset `server/db/manager-db.json` from seed
- `pnpm run build`: production build
- `pnpm run lint`: lint
