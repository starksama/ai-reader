# NOW.md — Mull Status

**Last updated:** 2026-01-31 10:00 (deadline)

## Current State: ✅ Ready for Testing (Deadline Met)

### Night Shift Progress (4am-10am)
- Fixed React hooks lint violations
- Added PWA manifest + mobile app metadata
- Verified codebase clean (~4800 LOC)

- **Build:** Passing (Next.js 16, Turbopack)
- **Lint:** Clean (0 errors)
- **Dev server:** Works locally
- **Commits:** 55+ commits

## Blocking for "Testable"

### Vercel Deployment
- `vercel.json` exists (region: hnd1)
- **Blocker:** No Vercel credentials configured
- **Action needed:** Anton to run `vercel login` and `vercel --prod`

## What Works
- Home page with URL input
- Article reader view
- Text selection → chat UI
- Highlighting
- Branch navigation
- Mobile selection (selectionchange + debounce)
- "Finish" → session summary
- Export notes as markdown

## What's Mocked
- AI responses (mock data, no real AI SDK yet)
- This is intentional for "testable except AI SDK"

## Test Checklist for Anton
- [ ] Deploy: `vercel --prod`
- [ ] Test URL parsing with real articles
- [ ] Test mobile selection on phone
- [ ] Test branch up/down navigation
- [ ] Test highlight feature
- [ ] Test finish/summary flow

## Quick Commands
```bash
cd ~/clawd/mull
pnpm dev      # Local dev server
pnpm build    # Production build
pnpm lint     # ESLint check
vercel        # Deploy preview
vercel --prod # Deploy production
```
