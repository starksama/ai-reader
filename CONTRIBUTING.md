# Contributing to Mull

> **Mull** — An AI-powered reader that lets you "dive deeper" into any article.

## Quick Start

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000 and paste any article URL.

---

## Architecture Overview

```
src/
├── app/                    # Next.js App Router
│   ├── api/parse/         # URL → Article extraction API
│   ├── demo/              # Demo pages with mock articles
│   ├── read/              # Main reader page
│   └── layout.tsx         # Root layout with providers
│
├── components/
│   ├── reader/            # Core reader components
│   │   ├── action-menu    # Unified menu (selection/paragraph/highlight)
│   │   ├── article-view   # Main article renderer
│   │   ├── highlighted-text # Highlight rendering within paragraphs
│   │   └── ...
│   ├── layers/            # Layer stack navigation
│   ├── chat/              # AI chat bubbles
│   └── ui/                # Reusable UI primitives
│
├── hooks/
│   ├── use-text-selection # Cross-platform text selection tracking
│   └── use-keyboard-shortcuts
│
├── stores/                # Zustand stores (persisted)
│   ├── highlight-store    # User highlights per article
│   ├── layer-store        # Navigation layer stack
│   ├── theme-store        # Theme, font size, highlight color
│   └── reader-store       # Reader state
│
└── data/
    └── mock-articles      # Demo content
```

---

## Core Design Decisions

### 1. Unified Action Menu

**Problem:** Multiple competing menus (selection, paragraph click, highlight click) with different UX on mobile vs desktop.

**Solution:** Single `ActionMenu` component that handles all three modes:
- `selection` — User selected text
- `paragraph` — User clicked on paragraph (no selection)
- `highlight` — User clicked on existing highlight

**UX:**
- **Mobile:** Bottom sheet (slides up)
- **Desktop:** Floating menu near click position

### 2. Text Selection Handling

**Problem:** Storing `Range` objects leads to stale/corrupted references, especially during drag-selection.

**Solution:** `useTextSelection` hook:
- Only stores `text` and `paragraphIndex` (primitives)
- Provides `getSelectionRect()` function called on-demand
- Uses `mouseup` event for desktop (fires after selection completes)
- Uses `selectionchange` for mobile touch devices

### 3. Highlight Colors

**Philosophy:** Sophisticated, muted tones — not "highlighter bright."

Inspired by Greptile's aesthetic:
- Sage/forest green (default)
- Warm gold, steel blue, dusty rose, terracotta
- Theme-aware opacity (light: 28-35%, dark: 22-25%, sepia: 28-32%)

See `stores/theme-store.ts` → `highlightColorMap`.

### 4. Layer Navigation

Content is explored via **layers** (like browser tabs, but stacked):
- Click "Dive Deeper" → opens new layer
- Swipe back or click breadcrumb → return
- Each layer can have its own AI conversation

### 5. Paragraphs as First-Class Citizens

Every paragraph is:
- Individually addressable (`data-paragraph-index`)
- Clickable (shows menu)
- Can have highlights
- Tracks "explored" state

---

## Styling Guide

### CSS Variables (defined in `globals.css`)

```css
/* Backgrounds */
--bg-primary      /* Main background */
--bg-secondary    /* Cards, menus */
--bg-tertiary     /* Hover states */

/* Text */
--text-primary    /* Main content */
--text-secondary  /* Muted text */

/* Accent */
--accent          /* Primary action color */
--accent-subtle   /* Light accent background */

/* Other */
--highlight       /* Hover/selected states */
--border          /* Borders */
```

### Component Styling

- Use CSS variables via `style={{ color: 'var(--text-primary)' }}`
- Tailwind for layout/spacing only
- Framer Motion for animations

### Animation Timing

| Type | Duration | Use |
|------|----------|-----|
| Fast | 100-150ms | Menus, tooltips |
| Normal | 200ms | Page transitions |
| Slow | 300ms | Loading states |

---

## State Management

All stores use **Zustand** with persistence:

```typescript
// Example: theme-store.ts
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'mull-theme' }  // localStorage key
  )
);
```

### Store Responsibilities

| Store | Purpose |
|-------|---------|
| `theme-store` | Theme, font size, highlight color |
| `highlight-store` | Per-article highlights |
| `layer-store` | Navigation layer stack |
| `reader-store` | Current reader state |
| `notes-store` | Export functionality |

---

## Adding Features

### New Reader Component

1. Create in `src/components/reader/`
2. Use CSS variables for theming
3. Accept callbacks for actions (don't navigate directly)
4. Support both mobile and desktop

### New Theme Color

1. Add to `HighlightColor` type in `theme-store.ts`
2. Add colors to `highlightColorMap` for all three themes
3. Update settings panel UI

### New Store

1. Create in `src/stores/`
2. Use Zustand with `persist` middleware if data should survive refresh
3. Export typed hook: `export const useMyStore = create<MyState>()(...)`

---

## File Naming

- Components: `kebab-case.tsx` (e.g., `action-menu.tsx`)
- Stores: `kebab-case.ts` with `-store` suffix
- Hooks: `kebab-case.ts` with `use-` prefix
- Types: Inline or in component file (no separate types file unless shared)

---

## Testing Checklist

Before submitting:

- [ ] Works on mobile (Chrome DevTools → mobile view)
- [ ] Works on desktop
- [ ] Theme switching works (light/dark/sepia)
- [ ] Text selection works properly
- [ ] Highlights render correctly
- [ ] No TypeScript errors (`pnpm tsc --noEmit`)

---

## Common Gotchas

1. **Range objects go stale** — Never store them. Use `getSelectionRect()`.
2. **Mobile vs Desktop selection** — Different event timing. Use the hook.
3. **Z-index conflicts** — Check `docs/UI-GUIDE.md` for z-index scale.
4. **CSS variables** — Always use `var(--name)`, not hardcoded colors.

---

## Questions?

Open an issue or reach out to the maintainers.
