# AI Reader

**Understand anything deeper** — A reading-first AI tool for any article.

Paste a URL, read in a clean distraction-free view, select any text to dive deeper with AI.

## Features

- **Text Selection** — Select any text to dive deeper with AI
- **Pure Highlighting** — Mark important passages without triggering AI
- **Clean Reader** — Distraction-free reading with progress tracking  
- **Smooth Transitions** — Framer Motion powered animations
- **Notes Export** — Save highlights and Q&A as markdown
- **Themes** — Light, dark, and sepia modes with font size control
- **Mobile-First** — Touch-friendly bottom sheet for selection actions
- **Keyboard Shortcuts** — Navigate explored items with ↑↓, Escape to go back
- **Branch Navigation** — Jump between explored paragraphs

## How It Works

1. **Paste any article URL** or try the demo articles
2. **Read** in a clean, focused environment
3. **Select text** you want to understand better
4. **Dive Deeper** — ask questions, get explanations
5. **Export** your notes as markdown

## Tech Stack

- **Next.js 16** — App Router, React Server Components
- **Tailwind CSS 4** — Utility-first styling
- **Framer Motion** — Smooth animations
- **Zustand** — State management with IndexedDB persistence
- **Readability.js** — Article parsing (Mozilla)

## Getting Started

```bash
# Install
pnpm install

# Development
pnpm dev

# Build
pnpm build
```

## Mobile Support

- Touch and drag to select text
- Bottom sheet for selection actions (doesn't conflict with native menu)
- Responsive design with mobile-optimized typography

## Roadmap

- [ ] Real AI integration (Gemini/Claude)
- [ ] Text-to-speech
- [ ] Browser extension
- [ ] Reading history
- [ ] Highlight annotations

## License

MIT

---

Built by [@starksama](https://github.com/starksama)
