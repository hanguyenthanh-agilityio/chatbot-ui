# AI SDK Playground (Next.js)

Playground app to test **AI SDK UI** + **AI SDK Core** features in one place.

## Included demos

- Core chat streaming (`streamText`)
- Tool mode (single tool)
- Agent mode (multi-tool chain via `stopWhen + stepCountIs`)
- Multi-agent mode (planner + researcher + writer pipeline)
- Prompt mode (deterministic formatted outputs)
- MCP tools integration (`@ai-sdk/mcp`)
- Chat history persistence (localStorage)
- File-aware chat attachments (image/PDF/DOCX/TXT/MD/CSV/JSON)
- Image generation lab (`generateImage`)

## Routes

- `/` overview
- `/chat` chat lab (with persistence + file attachments)
- `/image` image generation lab

## Stack

- Next.js (App Router)
- AI SDK: `ai`, `@ai-sdk/react`
- Providers: `@ai-sdk/openai`, Ollama via OpenAI-compatible endpoint
- MCP client: `@ai-sdk/mcp`
- File parsing: `pdf-parse`, `mammoth`
- Validation schemas: `zod`

## Quick start

1. Install dependencies

```bash
pnpm install
```

2. Create env file

```bash
cp .env.example .env.local
```

3. Pull Ollama models (free local)

```bash
pnpm run ollama:pull
pnpm run ollama:pull:vision
```

4. Start app

```bash
pnpm run dev
```

Open: `http://localhost:3000`

## Environment

Default local chat with Ollama:

```env
AI_PROVIDER=ollama
AI_MODEL=qwen2.5:3b
OLLAMA_VISION_MODEL=gemma3:4b
OPENAI_API_KEY=ollama
OPENAI_BASE_URL=http://localhost:11434/v1
```

Optional OpenAI mode:

```env
AI_PROVIDER=openai
AI_MODEL=gpt-4o-mini
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1
```

Optional extra features:

```env
# Image generation model (OpenAI image lab)
OPENAI_IMAGE_MODEL=gpt-image-1

# MCP integration
# If omitted, app uses built-in local stdio MCP demo server
# MCP_SERVER_URL=https://your-mcp-server.example.com/mcp
# MCP_AUTH_TOKEN=your_optional_bearer_token
# MCP_STDIO_COMMAND=node
# MCP_STDIO_SERVER_PATH=scripts/mcp-demo-server.mjs
```

## Attachment behavior in chat

- **Images**: kept as image parts. With Ollama provider, route tries `OLLAMA_VISION_MODEL` first, then auto-falls back to installed vision models.
- **PDF / DOCX / text-like files**: server extracts text and injects it into prompt context.
- Unsupported file formats return a fallback text note asking for plain text summary.

## Provider check for image generation page (`/image`)

- `openai`: ✅ Supported
- `ollama`: ❌ Not supported on this page (this page intentionally uses OpenAI image API only)

## Scripts

- `pnpm run dev`: run web + Ollama + MCP demo server together
- `pnpm run dev:web`: run Next.js only
- `pnpm run dev:ollama`: start Ollama only if not running
- `pnpm run dev:mcp`: run local MCP demo server (stdio)
- `pnpm run ollama:pull`: pull default local text model
- `pnpm run ollama:pull:vision`: pull local vision model for chat image Q&A
- `pnpm run mcp:demo`: run local MCP demo server manually (stdio)
- `pnpm run lint`: lint
- `pnpm run build`: production build
