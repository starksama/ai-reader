# Key Decisions

Concise log of architectural and design choices.

---

## 2026-01-30

### Product Vision
- **Core problem:** AI chats are single-threaded. Tangents pollute context.
- **Solution:** Branching conversations. Any message can spawn a thread.
- **Tagline:** "Branch freely. Never start over."

### Naming
- **Product:** Mull (to ponder, think carefully)
- Alternatives rejected: Branch (too literal), Grok (xAI uses it), Tangent (negative)

### Data Architecture
- **Tree via parent_id** — Messages table with `parent_id` creates the tree
- **Sources optional** — Can start with just a question, no article needed
- **Infinite depth** — Any message can branch, no artificial limits
- See `ARCHITECTURE.md` for full schema

### Content Input
- **URL fetch:** Jina Reader API (primary), direct fetch (fallback)
- **Paste:** Client-side parsing (markdown, HTML, plain text)
- **Why Jina:** Free, handles JS sites, not blocked by most CDNs

### UI/UX
- **Unified action menu** — Same component for selection, paragraph click, highlight
- **Mobile:** Bottom sheet | **Desktop:** Floating menu
- **Theme:** Light/dark only (removed sepia)
- **Typography:** Source Serif 4 (reading), Inter (UI)
- **Highlights:** Muted colors, theme-aware opacity (Greptile-inspired)

### Auth Strategy (planned)
- Google OAuth only (lowest friction)
- Supabase for storage
- Local-first → optional sync migration path

### Billing (planned)
- LiteLLM proxy for AI calls
- User gets unique API key
- Usage-based billing via LiteLLM

### Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS 4
- **State:** Zustand (with persistence)
- **Animation:** Framer Motion
- **Content extraction:** Jina Reader + Readability.js

---

## Naming Conventions

| Concept | Name | Notes |
|---------|------|-------|
| Product | Mull | "To ponder" |
| Content source | Source | Article, paste, markdown |
| Conversation | Thread/Branch | Emerges from parent_id |
| Navigation state | Layer | UI-only, for stack navigation |
| User annotation | Highlight | With optional note |

---

## What We Explicitly Rejected

- **Sidebar layout** — Felt disconnected. Chose full-screen layers instead.
- **Separate branches table** — Overcomplicated. Tree IS the messages.
- **Required source** — Users should be able to just ask a question.
- **Sepia theme** — Low priority, removed for simplicity.
- **Complex focus outlines** — Removed all, using hover states instead.
