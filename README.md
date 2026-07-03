# NOCTURNE

**Local-first AI creative studio.** Cinematic images, animated hero backgrounds, AI-written React components and a prompt direction engine — one dark room, running entirely on your machine.

> Private tool. No deploy target, no telemetry, no cloud storage. Generated assets live on disk.

## Modules

| Module | What it does |
|--------|--------------|
| **Prompt Engine** | Composes shots from subject + style preset (8 curated directions) + camera angle + lighting setup. One-click AI enhancement rewrites it into a director-grade prompt. |
| **Image Studio** | Generates images via Gemini (`gemini-2.5-flash-image`), saves PNGs to `public/generated/`, gallery with detail view, side-by-side compare, download, delete. |
| **Motion Engine** | Four parametrized real-time hero backgrounds (Aurora, Particle Field, Signal Waves, Horizon Grid). Tune hue/speed/intensity live, export as a self-contained React component. |
| **Code Generator** | Claude writes React Three Fiber scenes or hero sections from a description. Rendered live in a sandboxed iframe (esm.sh + Babel), iterative refine loop, copy/save. |
| **Library** | Unified local asset store — images, components, motion presets. Search across prompts and tags, filter by type. |

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind v4 · Framer Motion · Zustand · cmdk · Canvas 2D · @anthropic-ai/sdk · @google/genai

## Setup

```bash
npm install
npm run dev   # http://localhost:3333 (or default 3000)
```

Open **Settings** in the app and paste:

- **Gemini API key** (free tier — powers image generation + text fallback)
- **Anthropic API key** (optional — powers prompt enhancement + code generation with Claude)

Keys are stored in `.nocturne/config.json` (gitignored) or read from `ANTHROPIC_API_KEY` / `GEMINI_API_KEY` env vars. Env vars win.

## Keyboard

- `⌘K` / `Ctrl+K` — command palette
- `⌘1–6` — jump between modules
- `⌘⏎` — generate (in any prompt box)

## Architecture

```
src/
├── app/              # routes + API (settings, enhance, generate/*, assets)
├── components/
│   ├── shell/        # Dock, CommandPalette, AmbientBackground, AppShell
│   ├── motion/       # parametrized background renderers + code templates
│   └── ui/           # Button, PageHeader
└── lib/
    ├── server/       # ai.ts (provider abstraction), config.ts, assets.ts
    ├── prompt-presets.ts
    ├── sandbox.ts    # isolated iframe renderer for generated code
    ├── store.ts      # zustand
    └── types.ts
```

Provider layer is swappable: `generateText` prefers Claude when a key exists, falls back to Gemini; `generateImage` targets Gemini. Adding a provider = one function in `src/lib/server/ai.ts`.

## Roadmap slots

- Video generation module (plugin slot reserved — needs a provider worth paying for)
- R3F preset gallery in Motion Engine
- Prompt template save/load
- Asset collections
