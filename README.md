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

Mock production behavior locally (for testing production UI/runtime rules):

```bash
pnpm run dev:mock-production
```

This enables `NEXT_PUBLIC_MOCK_PRODUCTION=true` so local behaves like production defaults.

## Local run + Cloudflare Quick Tunnel (public URL)

Use this when app is deployed on Vercel but you want to route chat to your local Ollama + MCP.

1. Start local services

```bash
# Terminal A
ollama serve

# Terminal B
pnpm run dev:mcp
```

2. Open Cloudflare Quick Tunnels

```bash
# Terminal C (Ollama)
pnpm run tunnel:ollama
# or: cloudflared tunnel --url http://127.0.0.1:11434 --http-host-header 127.0.0.1:11434

# Terminal D (MCP HTTP server)
pnpm run tunnel:mcp
# or: cloudflared tunnel --url http://127.0.0.1:4001 --http-host-header 127.0.0.1:4001
```

3. Copy the 2 public URLs from cloudflared output:

- Ollama tunnel: `https://xxxx.trycloudflare.com`
- MCP tunnel: `https://yyyy.trycloudflare.com`

4. In your Vercel app `/chat`:

- Select provider: **Ollama**
- Enter **Ollama base URL**: `https://xxxx.trycloudflare.com` (app auto-adds `/v1`)
- If mode is **MCP**, enter **MCP server URL**: `https://yyyy.trycloudflare.com` (app auto-adds `/mcp`)
- Click **Verify URL** / **Verify URLs** before sending chat messages

5. Smoke test public URLs

```bash
curl https://xxxx.trycloudflare.com/api/tags
curl -i https://yyyy.trycloudflare.com/mcp
```

Notes:

- `GET /mcp` returns `405` is expected (MCP uses POST for requests).
- If you see `403 Forbidden`, make sure `--http-host-header` is set (Ollama and MCP in this project validate host headers).
- Quick Tunnel URLs change after restart. Refill new URLs in the app.
- For stable URLs, use Cloudflare Named Tunnel + your domain.

## Environment

Default local chat with Ollama:

```env
AI_PROVIDER=ollama
AI_MODEL=qwen2.5:3b
OLLAMA_MODEL=qwen2.5:3b
OLLAMA_VISION_MODEL=gemma3:4b
OPENAI_API_KEY=ollama
OPENAI_BASE_URL=http://localhost:11434/v1
```

Optional OpenAI mode:

```env
AI_PROVIDER=openai
AI_MODEL=gpt-4o-mini
OPENAI_MODEL=gpt-4o-mini
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1
NEXT_PUBLIC_OPENAI_SERVER_READY=true
```

Optional extra features:

```env
# Image generation model (OpenAI image lab)
OPENAI_IMAGE_MODEL=gpt-image-1

# MCP integration
# If omitted, app uses built-in local stdio MCP fallback server
# MCP_SERVER_URL=https://your-mcp-server.example.com/mcp
# MCP_AUTH_TOKEN=your_optional_bearer_token
# MCP_STDIO_COMMAND=node
# MCP_STDIO_SERVER_PATH=scripts/mcp-demo-server-stdio.mjs
```

Production behavior:

- Default provider is **OpenAI**.
- If you switch production to **Ollama**, enter URLs in chat UI inputs:
  - **Ollama base URL** (e.g. `https://your-tunnel.example.com`; app auto-adds `/v1`)
  - **MCP server URL** (required only when using MCP mode)
  - Click **Verify URL(s)** first; chat input stays disabled until verification succeeds
- You can still keep env defaults if needed:

```env
AI_PROVIDER=ollama
OPENAI_BASE_URL=https://your-ollama-tunnel.example.com/v1
OLLAMA_TAGS_ENDPOINT=https://your-ollama-tunnel.example.com/api/tags
MCP_SERVER_URL=https://your-mcp-server.example.com/mcp
```

## Attachment behavior in chat

- **Images**: kept as image parts. With Ollama provider, route tries `OLLAMA_VISION_MODEL` first, then auto-falls back to installed vision models.
- **PDF / DOCX / text-like files**: server extracts text and injects it into prompt context.
- Unsupported file formats return a fallback text note asking for plain text summary.

## Provider check for image generation page (`/image`)

- `openai`: ✅ Supported
- `ollama`: ❌ Not supported on this page (this page intentionally uses OpenAI image API only)
- On `/image`, OpenAI key verification is required before `Generate image` is enabled.

## Scripts

- `pnpm run dev`: run web + Ollama + MCP demo HTTP server together
- `pnpm run dev:mock-production`: run local with production-like behavior toggled on
- `pnpm run dev:web`: run Next.js only
- `pnpm run dev:ollama`: start Ollama only if not running
- `pnpm run dev:mcp`: run local MCP demo HTTP server at `http://127.0.0.1:4001/mcp`
- `pnpm run tunnel:ollama`: open Cloudflare Quick Tunnel for local Ollama (`11434`)
- `pnpm run tunnel:mcp`: open Cloudflare Quick Tunnel for local MCP HTTP server (`4001`)
- `pnpm run ollama:pull`: pull default local text model
- `pnpm run ollama:pull:vision`: pull local vision model for chat image Q&A
- `pnpm run mcp:demo`: run local MCP demo HTTP server manually
- `pnpm run mcp:demo:stdio`: run local MCP demo stdio fallback server manually
- `pnpm run lint`: lint
- `pnpm run build`: production build
