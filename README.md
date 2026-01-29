# 📖 AI Reader

**Explainpaper for everything** — A reading-first AI tool that helps you understand any article.

Paste a URL, read in a clean distraction-free view, tap any paragraph to dive deeper with AI assistance.

## Features

- **🔗 URL Parsing** — Paste any article URL, powered by Readability.js
- **📖 Clean Reader** — Distraction-free reading with progress tracking
- **✨ Tap to Explore** — Click any paragraph to get AI explanations
- **📝 Export Notes** — Save your highlights and Q&A as markdown
- **🎨 Themes** — Light, dark, and sepia modes
- **📱 Mobile-First** — Swipe gestures, touch-friendly UI
- **⌨️ Keyboard Shortcuts** — Escape to go back, Alt+Left for navigation

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **State:** Zustand with persist middleware
- **Animations:** Framer Motion
- **Parsing:** @mozilla/readability + jsdom
- **Language:** TypeScript

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build
```

Open [http://localhost:3000](http://localhost:3000) to start reading.

## Roadmap

- [ ] Real AI integration (Gemini/Claude)
- [ ] Text-to-speech for paragraphs
- [ ] Highlight and annotate
- [ ] Reading history
- [ ] Browser extension

## License

MIT

---

Built with ⚡ by [@starksama](https://github.com/starksama)
