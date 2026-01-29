# AI Reader TODO

## 🔴 High Priority

### Mobile Selection (Critical)
- [x] Native browser menu conflicts with custom menu
- [x] Solution: Bottom sheet on mobile (doesn't conflict)
- [x] 300ms delay to let native menu appear first
- [ ] Consider native app for better UX (React Native/Expo)

### Still Needs Work
- [x] Settings panel (theme, font size)
- [x] Typography review - ensure consistency
- [x] Spacing audit

### Testing
- [ ] Test on real URLs (Vercel deploy)
- [ ] Test mobile selection thoroughly
- [ ] Test branch navigation

## 🟡 Medium Priority
- [x] Add keyboard shortcut hints
- [ ] Better loading states
- [x] Error boundaries
- [ ] Empty states

## 🟢 Done (40 commits)
- [x] Click vs selection separation
- [x] UI Guide document  
- [x] Mobile selection support
- [x] Page transitions (Framer Motion)
- [x] Formal aesthetic (no emojis, small roundness)
- [x] Lucide icons unified
- [x] Branch navigation (up/down = explored items)
- [x] Pure highlighting feature
- [x] Highlight store
- [x] Export includes highlights
- [x] Selection menu (Dive deeper, Highlight, Copy)
- [x] Paragraph menu (on click)
- [x] All components reviewed for style
- [x] Settings panel with font size control
- [x] Error boundaries
- [x] Keyboard shortcut hints modal

## First Principles
- Core purpose: Help users UNDERSTAND what they read
- Primary flow: Read → Highlight → Ask → Save
- UI should be invisible - content is king

## Review Checklist (30 min cycle)
1. Test all interactions locally
2. Check mobile responsiveness
3. Verify animations are smooth
4. Ensure consistent styling
5. Push commits
