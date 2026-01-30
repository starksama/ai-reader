# Contributing to Mull

> **Mull** — Branch freely. Never start over.

## Quick Start

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000, paste a URL or content, and start exploring.

---

## Project Structure

```
src/
├── app/                     # Next.js App Router
│   ├── api/parse/          # URL → content extraction (Jina + Readability)
│   ├── demo/               # Demo pages with mock articles
│   ├── read/               # Main reader page
│   └── page.tsx            # Homepage
│
├── components/
│   ├── reader/             # Core reader components
│   │   ├── action-menu.tsx # Unified menu (selection/paragraph/highlight)
│   │   ├── article-view.tsx # Article renderer
│   │   ├── highlighted-text.tsx
│   │   ├── settings-panel.tsx
│   │   └── ...
│   ├── layers/             # Navigation
│   │   └── detail-layer.tsx # Conversation view
│   ├── chat/               # Chat bubbles
│   └── ui/                 # Primitives (popup, toast)
│
├── hooks/
│   ├── use-text-selection.ts
│   └── use-keyboard-shortcuts.ts
│
├── stores/                  # Zustand (client-side state)
│   ├── highlight-store.ts  # Per-article highlights
│   ├── layer-store.ts      # Navigation stack
│   ├── reader-store.ts     # Current reader state
│   ├── notes-store.ts      # Export functionality
│   └── theme-store.ts      # Theme, fonts, colors
│
├── utils/
│   └── parse-content.ts    # Client-side content parsing
│
└── data/
    └── mock-articles.ts    # Demo content
```

---

## Key Files

| File | Purpose |
|------|---------|
| `app/api/parse/route.ts` | URL fetching (Jina → Readability fallback) |
| `components/reader/action-menu.tsx` | Unified interaction menu |
| `components/reader/article-view.tsx` | Main article component |
| `stores/layer-store.ts` | Navigation state (push/pop/reset) |
| `utils/parse-content.ts` | Client-side markdown/HTML parsing |

---

## Architecture

See `docs/ARCHITECTURE.md` for full data model.

**Core concept:** Messages with `parent_id` form a tree. Any message can branch.

**Current state:** Local-first with Zustand. Backend (Supabase) planned.

---

## Styling

Use CSS variables from `globals.css`:
- `--bg-primary`, `--bg-secondary`
- `--text-primary`, `--text-secondary`
- `--accent`, `--highlight`, `--border`

Typography:
- Reading: `var(--font-reading)` (Source Serif 4)
- UI: `var(--font-sans)` (Inter)

---

## Before Submitting

- [ ] `pnpm tsc --noEmit` — no TypeScript errors
- [ ] Test on mobile viewport
- [ ] Test light/dark themes
- [ ] No hardcoded colors (use CSS vars)

---

## Docs

| Doc | Content |
|-----|---------|
| `docs/ARCHITECTURE.md` | Data model, schema, queries |
| `docs/DECISIONS.md` | Key decisions log |
| `docs/UI-GUIDE.md` | Colors, typography, components |
