# NOW.md — Mull Status

**Last updated:** 2026-02-02 07:00 (night shift)

## Current State: ✅ Deployed & Refactored + Remote Sync

### 🔧 Night Shift (01:00-03:00)
**Features Added:**
1. ✅ **Remote Sync**: Integrated `useSessionStore` with `DetailLayer`. 
   - Automatic session creation/detection for URLs.
   - Real-time message syncing to Supabase when logged in.
   - Dual-persistence (Local-first + Supabase-backup).

### 🧹 Tonight's Cleanup (19:00-23:30)
Major refactor based on Gemini + manual code review:

**Bugs Fixed:**
1. ❌ No reactivity → ✅ Zustand selector subscriptions
2. ❌ State duplication → ✅ Direct store reads
3. ❌ useEffect sync anti-pattern → ✅ Removed
4. ❌ Potential infinite loops → ✅ useCallback selectors
5. ❌ Data denormalization → ✅ Single source of truth (threads only)
6. ❌ Auth race condition → ✅ Shared initialization promise
7. ❌ Auth memory leak → ✅ Subscription cleanup

**Other Changes:**
- Magic link auth (no more OAuth setup needed)
- Better API error handling
- Store version migration for backward compat
- Non-streaming responses (fixes blinking)

### Commits Tonight
- `63374d4` docs: update roadmap to reflect current state
- `bb50825` refactor: migrate middleware.ts to proxy.ts (Next.js 16)
- `ab31b58` polish: add favicon, fix viewport export, improve loading skeleton
- `67f8f6c` fix: memoize messages array to prevent unnecessary re-renders
- `4fab886` fix: lint errors in login-button, export-button, finish-button
- `88ad237` fix(auth): race condition and memory leak
- `2ff6fe1` fix: major refactor based on code review
- `7418ed1` fix: race condition in thread storage
- `ad21c2d` fix: address 4 bugs from feedback
- `2c84e73` feat(auth): switch from OAuth to magic link

## What Works
- ✅ Home page with URL input
- ✅ Article reader view
- ✅ Text selection → chat UI
- ✅ Highlighting
- ✅ Branch navigation (up/down through explored paragraphs)
- ✅ Thread persistence (localStorage)
- ✅ "Finish" → session summary
- ✅ Export notes as markdown
- ✅ Magic link auth (Supabase)
- ✅ Real AI responses (GPT-4o-mini)
- ✅ Mobile selection handling

## Requires Setup
- `OPENAI_API_KEY` in Vercel env
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Supabase: Site URL + Redirect URLs configured
- Supabase: SMTP for magic links (or use Resend)

## Known Issues
- History sidebar uses session-store (Supabase) but app stores locally (notes-store)
  - Could sync to Supabase when logged in (future)

## Test Checklist
- [x] Deploy: Vercel auto-deploys on push
- [x] Build passes with all source code fixes
- [ ] Test magic link auth flow (manual)
- [ ] Test thread persistence (manual: ask question, navigate away, come back)
- [ ] Test export notes (manual)
- [ ] Test on mobile (manual)

## Code Review Notes (4am shift)
**Architecture is solid:**
- notes-store: Clean atomic operations, localStorage persist with migration
- auth-store: Race condition protection via shared promise, memory leak prevention
- detail-layer: Proper Zustand selectors with memoization for performance
- React Compiler compatible with fixed memoization patterns

## UI Polish (5am shift)
- Added favicon (M logo SVG)
- Fixed Next.js viewport export (no more build warnings)
- Added theme-color meta for mobile browser chrome
- Improved loading skeleton with staggered animations

## Cleanup (6am shift)
- Migrated middleware.ts → proxy.ts (Next.js 16 convention)
- All build warnings resolved ✅

## Final Review (7am shift)
- Updated README roadmap to reflect current state
- Verified build, routes, and demo data
- **Project ready for 10am testing** 🎉

## Quick Commands
```bash
cd ~/clawd/mull
pnpm dev      # Local dev server
pnpm build    # Production build
pnpm lint     # ESLint check
```

## Architecture (Clean)
```
stores/
├── notes-store.ts   # Threads per article (localStorage)
├── auth-store.ts    # Supabase auth state
├── session-store.ts # Supabase history (not integrated yet)
├── layer-store.ts   # Navigation stack
├── highlight-store.ts
├── theme-store.ts
└── reader-store.ts

components/
├── layers/detail-layer.tsx  # Chat with AI about paragraphs
├── reader/article-view.tsx  # Main reading view
├── auth/login-button.tsx    # Magic link auth
└── ...
```
