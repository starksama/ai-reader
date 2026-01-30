# Mull

### Your Second Brain for Complex Ideas

> **Dive into rabbit holes. Never lose the thread.**

Mull is a thinking tool for autodidacts, researchers, and the endlessly curious. Paste any content, ask questions, branch into tangents—Mull manages your context tree so you can explore freely without losing your way back.

---

## The Problem

You're reading something dense. A term catches your eye. You Google it. That leads to three Wikipedia tabs. Now you're watching a YouTube video about a tangentially related concept. An hour later, you can't remember what you were originally trying to understand.

**Mull fixes this.**

## The Solution

Mull maintains a **context tree** of your exploration:

```
📄 Original Article
 ├── 💭 "What does entropy mean here?"
 │    └── 🤖 AI explanation with examples
 │         └── 💭 "How does this relate to information theory?"
 │              └── 🤖 Deep dive on Shannon entropy
 ├── 💭 Highlighted: "thermodynamic equilibrium"
 │    └── 🤖 ELI5 breakdown
 └── 💭 "What are the practical applications?"
      └── 🤖 Real-world examples
```

**Every branch remembers its parent.** Jump anywhere, the context follows.

---

## Features

- **🌳 Context Tree** — Branch infinitely, never lose the main thread
- **💬 AI Conversations** — Ask follow-ups, get explanations, go deeper
- **✨ Smart Highlights** — Mark what matters, revisit later
- **📱 Mobile-First** — Touch-native with bottom sheets
- **🎨 Reading Modes** — Light, dark, sepia with adjustable fonts
- **⌨️ Keyboard Shortcuts** — Navigate with ↑↓, Escape to go back
- **📤 Export Notes** — Take your insights with you

---

## Quick Start

```bash
# Clone
git clone https://github.com/starksama/mull.git
cd mull

# Install
pnpm install

# Run
pnpm dev
```

Open http://localhost:3000 and paste any URL.

---

## Environment Variables

Create a `.env.local` file:

```bash
# AI Provider (choose one)
OPENAI_API_KEY=sk-...           # For GPT-4
ANTHROPIC_API_KEY=sk-ant-...    # For Claude
GOOGLE_AI_KEY=...               # For Gemini

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Note:** Currently runs with mock AI responses. Real AI integration coming soon.

---

## Philosophy

### Why "Mull"?

**mull** /məl/ *verb*  
To think about something deeply and at length.

*"She mulled over the implications of quantum mechanics while sipping her coffee."*

### Design Principles

1. **Reading-first** — UI never distracts from content
2. **Context is king** — Every question knows its ancestry  
3. **Branch freely** — Tangents are features, not bugs
4. **Return safely** — One swipe back to where you were

---

## Tech Stack

- **Next.js 16** — App Router, React 19
- **Tailwind CSS 4** — Utility-first styling
- **Framer Motion** — Smooth animations
- **Zustand** — State management with persistence
- **Readability.js** — Article extraction (Mozilla)

---

## Roadmap

- [x] Article parsing and clean reader view
- [x] Highlighting with theme-aware colors
- [x] Layer-based navigation (context tree)
- [x] Mock AI responses
- [ ] **Real AI integration** (OpenAI, Anthropic, Google)
- [ ] Multi-agent system (Explainer, Critic, Researcher)
- [ ] "Ask anything" mode (no URL needed)
- [ ] PDF and ePub support
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
  <em>Stop skimming. Start understanding.</em>
</p>
