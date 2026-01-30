# Mull

### Your Second Brain for Complex Ideas

> **Branch freely. Never start over.**

Mull is a thinking tool that lets you explore tangents without polluting your main thread. Ask follow-ups, go deep into rabbit holes, and always find your way back.

---

## The Problem

### Before AI: Tab Explosion
You're reading something dense. A term catches your eye. You Google it. Three Wikipedia tabs later, you're watching a YouTube video about a tangentially related concept. An hour passes. You forgot what you were originally trying to understand.

### With AI: Chat Pollution
Now you have ChatGPT. You paste an article and ask "what does X mean in paragraph 2?" Three back-and-forths later, you finally get it. But now your chat is **polluted**:

- The original article is buried under clarifications
- You want to ask about paragraph 5, but the context is all wrong
- The AI is still thinking about your tangent, not the main content  
- You can't easily reference what you were reading
- Frustrated, you **start a new chat**

And repeat.

### The Real Issue
AI chats are **single-threaded**. Every question pollutes the same context. There's no way to branch off, explore a tangent, and cleanly return to where you were.

---

## The Solution

Mull gives you **branching conversations**:

```
📄 Original Article
 ├── 💭 "What does entropy mean here?"
 │    └── 🤖 Explanation
 │         └── 💭 "How does this relate to information theory?"
 │              └── 🤖 Deep dive (your tangent lives here)
 │
 ├── 💭 "Explain paragraph 5" ← back to clean context
 │    └── 🤖 Fresh explanation, no tangent pollution
 │
 └── 💭 "Summarize the main argument"
      └── 🤖 Summary with full article context
```

**Every branch remembers its parent.** Your tangent about information theory doesn't pollute your question about paragraph 5. Jump anywhere—the right context follows.

---

## No More...

- 🔄 **"Let me start a new chat"** — Branch instead
- 📜 **Scrolling up to find the original** — It's always there
- 🤯 **"Wait, what were we talking about?"** — Context stays clean
- 😤 **AI stuck on your tangent** — Each branch has its own thread

---

## Features

- **🌳 Context Tree** — Branch infinitely, return instantly
- **💬 Scoped Conversations** — Each tangent is isolated
- **📍 Always Anchored** — Original content never buried
- **✨ Smart Highlights** — Mark what matters
- **📱 Mobile-First** — Touch-native navigation
- **📤 Export Notes** — Take your insights anywhere

---

## Quick Start

```bash
git clone https://github.com/starksama/mull.git
cd mull
pnpm install
pnpm dev
```

Open http://localhost:3000, paste a URL or content, and start exploring.

---

## Philosophy

### Why "Mull"?

**mull** /məl/ *verb* — to think about carefully; to ponder.

*"She mulled over the implications, branching into tangent after tangent, yet never losing the thread."*

### Alternative Names Considered

| Name | Vibe |
|------|------|
| **Mull** | Thoughtful, deliberate pondering |
| **Delve** | Going deep |
| **Branch** | The core mechanic |
| **Tangent** | What you're managing |
| **Warren** | Network of rabbit holes |
| **Grok** | Deep understanding (Heinlein) |

We stuck with **Mull** — short, memorable, captures the thoughtful exploration.

---

## Tech Stack

- **Next.js 16** — App Router, React 19
- **Tailwind CSS 4** — Utility-first styling  
- **Framer Motion** — Smooth animations
- **Zustand** — State management with persistence
- **Readability.js** — Article extraction

---

## Roadmap

- [x] Article parsing and reader view
- [x] Highlighting with theme-aware colors
- [x] Layer-based navigation (context tree)
- [x] Paste content support
- [ ] **Real AI integration** (OpenAI, Anthropic, Google)
- [ ] Branch visualization
- [ ] "Ask anything" mode (no source needed)
- [ ] Browser extension
- [ ] Sync across devices

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for architecture and guidelines.

---

## License

MIT

---

<p align="center">
  <strong>Branch freely. Never start over.</strong>
</p>
