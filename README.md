# Simple AI Chatbot (Next.js + AI SDK)

This project is a minimal chat app using:

- Next.js (App Router)
- AI SDK (`ai`, `@ai-sdk/react`)
- OpenAI provider (`@ai-sdk/openai`)

## 1. Configure Environment

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Set your OpenAI key:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

## 2. Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## 2.1 Run in Free Local Mode (No OpenAI Credits)

You can run this app with a local model (Ollama) using OpenAI-compatible API mode:

1. Install and start Ollama, then pull a model:

```bash
ollama pull qwen2.5:3b
```

2. Set `.env.local`:

```env
OPENAI_API_KEY=ollama
OPENAI_BASE_URL=http://localhost:11434/v1
OPENAI_MODEL=qwen2.5:3b
```

3. Start app:

```bash
npm run dev
```

This avoids OpenAI API quota usage entirely.

## 3. Main Files

- `src/app/page.tsx`: chat UI with `useChat()`
- `src/app/api/chat/route.ts`: streaming chat endpoint
- `.env.example`: required environment variable

## 4. Explore More AI Templates

- Vercel AI templates (all): https://vercel.com/templates/ai
- Next.js AI Chatbot: https://vercel.com/templates/ai/nextjs-ai-chatbot
- Next.js AI Lite: https://vercel.com/templates/ai/next-js-ai-lite
- Vercel AI Gateway Demo: https://vercel.com/templates/ai/vercel-ai-gateway-demo
- Pinecone + AI SDK Starter: https://vercel.com/templates/ai/pinecone-vercel-ai
- Gemini AI Chatbot: https://vercel.com/templates/ai/gemini-ai-chatbot
