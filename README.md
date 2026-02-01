# Mull

**Branch freely. Never start over.**

A thinking tool for complex content. Ask questions, explore tangents, and always find your way back.

---

## The Problem

AI chats are single-threaded. Ask a follow-up, and your whole context gets polluted. Eventually you give up and start a new chat.

**Mull fixes this.** Every message can branch. Go deep into a rabbit hole, then pop back to clean context.

---

## Features

- **🌳 Branching conversations** — Every message can spawn a thread
- **📍 Always anchored** — Source content never buried
- **🔄 Clean returns** — Pop back, context stays pristine
- **📝 Paste anything** — URLs, markdown, HTML, plain text
- **✨ Smart highlights** — Theme-aware, muted colors
- **📱 Mobile-first** — Touch-native with bottom sheets

---

## Quick Start

```bash
git clone https://github.com/starksama/mull.git
cd mull
pnpm install
pnpm dev
```

Open http://localhost:3000

---

## How It Works

```
📄 Source Content
 └── 💬 "What does X mean?"
      └── 🤖 "X means..."
           ├── 💬 "Tell me more" → goes deeper
           └── 💬 "Back to Y" → clean context
```

The tree IS the data structure. Messages with `parent_id`. Simple.

---

## Stack

- **Next.js 16** — App Router
- **Tailwind CSS 4** — Styling
- **Zustand** — State
- **Framer Motion** — Animation
- **Jina Reader** — Content extraction

---

## Roadmap

- [x] Content parsing (URL, paste, markdown, PDF)
- [x] Reader UI with highlights
- [x] Layer navigation
- [x] Real AI integration (GPT-4o-mini)
- [x] Magic link auth (Supabase)
- [x] Thread persistence (localStorage)
- [x] Export notes as markdown
- [ ] Cloud sync when logged in
- [ ] Usage tracking / billing

---

## Docs

- [Architecture](./docs/ARCHITECTURE.md) — Data model
- [Decisions](./docs/DECISIONS.md) — Why we built it this way
- [Contributing](./CONTRIBUTING.md) — How to help

---

## License

MIT

---

*Explore freely. Return cleanly.*
