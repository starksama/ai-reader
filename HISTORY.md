# Mull — Project History

Complete development log with decisions, rationale, and issues.

---

## Project Genesis

### The Problem Statement (v1)
**Original idea:** "Tab explosion" — people open too many tabs when researching.

**v1 approach:** AI reader that lets you "dive deeper" into text without leaving the page.

### The Problem Statement (v2) — Reframe
**Better insight:** The real problem isn't tabs — it's **AI chat pollution**.

When you're reading something and want to explore a tangent:
- Option A: Ask in current chat → pollutes context, AI gets confused
- Option B: Start new chat → lose all context, start from scratch

**Mull's solution:** Branch freely. Any message can spawn a thread. Go deep, return cleanly.

**Tagline:** "Branch Freely, Never Start Over"

---

## Timeline

### Day 1 (2026-01-29) — Foundation

**Commits:** Initial setup through basic reader

**Key decisions:**
- Next.js 16 + App Router (latest, server components)
- Tailwind CSS 4 (modern, fast)
- Zustand for state (simple, persist-friendly)
- Framer Motion for animations

**First features:**
- URL input → fetch article → render in reader view
- Basic text selection → show "dive deeper" button
- Mock AI responses (intentionally deferred real AI)

### Day 1 Night Shift — Core UX

**Issues encountered:**
1. **Content fetching failures** — Many sites block server-side fetches
   - *Solution:* Jina Reader API as primary fetcher (free, handles JS sites)
   - *Fallback:* Direct fetch for simple sites
   
2. **Mobile selection broken** — `mouseup` doesn't work reliably on mobile
   - *Solution:* `selectionchange` event with 300ms debounce
   - *Issue:* Still finicky, works ~80% of time

3. **Desktop selection bug** — Click on paragraph triggered selection menu
   - *Solution:* Separate click vs drag detection with threshold

**Rebrand:** AI Reader → **Mull** (to ponder, think deeply)
- Rejected: Branch (too literal), Grok (taken), Tangent (negative connotation)

### Day 2 (2026-01-30) — Polish & Architecture

**Architecture v2 decision:**
```
Messages table with parent_id = The entire tree structure
```

Rejected alternatives:
- Separate `branches` table → overcomplicated
- `conversation_id` grouping → artificial constraint

**Key insight:** "Any message can branch" — the tree IS the messages.

**UI/UX overhaul:**
- Unified ActionMenu component (selection, paragraph, highlight all use same menu)
- Mobile: bottom sheet | Desktop: floating menu
- Removed sepia theme (low priority, simplify)
- Font: Source Serif 4 (reading) + Inter (UI)

**Features added:**
- Highlights with muted theme-aware colors
- Keyboard navigation (↑↓ for branch history, Esc to go back)
- Settings panel (theme, font size)
- Session summary + markdown export ("Finish" button)
- Error boundaries for graceful failures
- PDF upload support (with pdf.js worker issues)

**Issues encountered:**
1. **PDF parsing unreliable** — pdf.js worker loading issues
   - *Solution:* Local .mjs worker file, dynamic import for SSR
   
2. **Focus ring artifacts** — Buttons showed ugly outlines
   - *Solution:* Removed all focus rings, rely on hover states
   
3. **Store persistence race** — Article lost on navigation
   - *Solution:* sessionStorage with careful hydration

### Day 2 Night Shift (2026-01-30 → 01-31) — Production Ready

**Goal:** Testable by 10am except AI SDK integration

**Commits:**
- `b142dba` — NOW.md for night shift tracking
- `f1243af` — Fixed React hooks lint violations
- `c5db643` — Added PWA manifest + mobile app metadata

**Issues fixed:**
1. **React hooks rule violation** — useCallback after early return
   - *Solution:* Moved hooks before conditional returns, used useMemo
   
2. **No PWA support** — Can't install on mobile
   - *Solution:* Added manifest.ts, viewport meta, Apple Web App config

**Final state at deadline (10am):**
- ✅ Build passing
- ✅ Lint clean (0 errors in source)
- ✅ All features working with mock AI
- ⏳ Blocked: Vercel deployment (needs credentials)

---

## Key Architectural Decisions

### 1. Tree via parent_id (not separate branches table)
**Rationale:** Simpler is better. The tree structure emerges naturally from message relationships. No need to manage "branch" entities separately.

### 2. Sources are optional
**Rationale:** Users should be able to just ask "explain quantum computing" without needing an article first. Flexibility > rigidity.

### 3. Mock AI first
**Rationale:** Build the entire UX before touching AI. Ensures the interaction model works before adding complexity.

### 4. Layer-based navigation (not sidebar)
**Rationale:** Full-screen layers feel more immersive for deep reading. Sidebar felt disconnected and cluttered.

### 5. Jina Reader for content extraction
**Rationale:** Free, handles JavaScript-rendered sites, not blocked by CDNs. Fallback to direct fetch for simple sites.

---

## Issues & Solutions Reference

| Issue | Symptom | Solution |
|-------|---------|----------|
| Mobile selection | Doesn't trigger on tap-hold | `selectionchange` + 300ms debounce |
| Desktop click vs select | Click triggers selection menu | Threshold-based detection |
| Content fetch blocked | 403/CORS errors | Jina Reader API |
| PDF worker loading | SSR crashes | Dynamic import, local .mjs file |
| Focus ring artifacts | Ugly blue outlines | Remove all focus rings |
| Store persistence | Article lost on nav | sessionStorage with hydration |
| React hooks lint | useCallback after return | Move hooks before conditionals |

---

## Tech Stack (Final)

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 16 | App Router, server components |
| Styling | Tailwind CSS 4 | Fast, utility-first |
| State | Zustand | Simple, persist-friendly |
| Animation | Framer Motion | Smooth, declarative |
| Content | Jina Reader + Readability.js | JS sites + fallback |
| PDF | pdf.js | Industry standard |
| Icons | Lucide React | Clean, consistent |
| Font | Source Serif 4 + Inter | Reading + UI |

---

## What's Next (Planned)

### Immediate
- [ ] Vercel deployment
- [ ] Real AI integration (Anthropic/OpenAI via AI SDK)

### Auth & Persistence
- [ ] Google OAuth (Supabase)
- [ ] Save conversations to database
- [ ] Sync across devices

### Monetization
- [ ] LiteLLM proxy for AI calls
- [ ] Usage-based billing
- [ ] User API keys

### Features
- [ ] Highlight editing (currently stubbed)
- [ ] Share specific branches
- [ ] Collaborative reading sessions

---

## Naming Conventions

| Concept | Name | Notes |
|---------|------|-------|
| Product | Mull | "To ponder" |
| Content source | Source | Article, paste, PDF |
| Conversation | Thread/Branch | Path through tree |
| Navigation | Layer | UI stack concept |
| User annotation | Highlight | With optional note |

---

## Commits Log (Condensed)

```
ccc064c docs: 10am deadline status
c5db643 polish: PWA manifest + mobile metadata
f1243af fix: React hooks violations
b142dba Add NOW.md for tracking
bbf5b50 PDF text extraction improvements
4d3aa5f Fix PDF upload race condition
6f6204a Clean up detail layer
220d2f0 Fix store persistence (sessionStorage)
363bfde Fix PDF worker (local .mjs)
be976e6 Add PDF support
97be377 Jina Reader integration
e418ea5 Architecture v2 + cleaner homepage
e81e277 Reframe: AI chat pollution
598ce2f Unified ActionMenu component
dd48595 Dark green theme + highlights
a41d034 Rebrand: AI Reader → Mull
9bb599b Finish button + session summary
6ff4fb0 Follow-up questions
26260b0 Rounded-md for friendlier UI
ac8942f Keyboard shortcuts modal
c26f806 Error boundaries
fc8b57c Settings panel
73bb1da Clean up UI aesthetics
73ed871 Mobile bottom sheet menu
450bb1e Lucide icons + highlights
193e729 Separate click vs selection
```

---

*Last updated: 2026-01-31 10:32*
