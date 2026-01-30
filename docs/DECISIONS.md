# Key Decisions

Quick log of architectural and design decisions.

---

## 2026-01-30

### Naming: Keep "Mull"
- Short, memorable, means "to ponder"
- Alternatives considered: Delve, Branch, Tangent, Warren, Grok
- Rejected: Branch (too literal), Grok (xAI uses it), Tangent (negative connotation)

### Core Problem Statement
- **Not** "tab explosion" (old problem)
- **Yes** "chat pollution" — AI chats are single-threaded, tangents pollute context
- Key pain: "Let me start a new chat" → Mull fixes this with branching

### Content Input
- URL fetch (server-side, can fail on Vercel)
- **Paste support** (client-side, always works) — primary fallback
- Markdown auto-detection added
- Future: PDF, ePub, browser extension

### Data Model
- **Branching tree**: Source → Branches → Messages
- Each branch has `parent_id` for tree structure
- `paragraph_index` + `selected_text` anchor branches to source
- JSONB fields for future extensibility (`settings`, `metadata`, `parsed_content`)

### Auth Strategy
- Google OAuth only (lowest friction)
- Supabase for storage
- Can add more providers later

### Billing via LiteLLM
- User gets unique API key from Mull's LiteLLM instance
- LiteLLM tracks usage per key
- Mull doesn't handle payments directly — LiteLLM does
- `usage_logs` table for user-facing stats only

### Migration Path
1. **Local-first** (current) — IndexedDB, no auth required
2. **Optional sync** — Google login, Supabase backup
3. **Full cloud** — LiteLLM billing, team features

### UI Decisions
- **Unified action menu** — same component for selection, paragraph click, highlight click
- **Mobile**: bottom sheet | **Desktop**: floating menu
- **Serif font** for reading (Source Serif 4), **sans-serif** for UI (Inter)
- Highlight colors: muted/sophisticated, not highlighter-bright (inspired by Greptile)

### Homepage Messaging
- Don't list generic features (AI, highlights = table stakes)
- Focus on core differentiator: **branching conversations**
- Tagline: "Branch freely. Never start over."
- Comparison: "With chatbots → polluted. With Mull → branch off"
