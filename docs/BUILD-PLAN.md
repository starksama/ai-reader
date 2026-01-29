# AI Reader — Build Plan

**Framework:** Next.js 14 (App Router)  
**Styling:** Tailwind CSS  
**State:** Zustand  
**Storage:** IndexedDB (Dexie.js)

---

## Design Decisions

- **Both mobile + desktop** from day 1
- **Modern sans-serif fonts** (Inter), allow customization later
- **Minimal breadcrumb** (`← main / p-2`)
- **Sepia mode** — lower priority, add later

---

## Async Loading Architecture (Day 1)

**Critical:** Design for streaming/async from the start.

### Content Generation Pattern
```typescript
interface StreamState {
  isLoading: boolean;
  isStreaming: boolean;
  content: string;
  error: string | null;
}

// Simulated streaming for now
async function* simulateStream(text: string, delayMs = 30) {
  const words = text.split(' ');
  for (const word of words) {
    yield word + ' ';
    await sleep(delayMs);
  }
}
```

### UI States
1. **Idle** — Input ready
2. **Loading** — Thinking indicator (dots or spinner)
3. **Streaming** — Text appearing word by word
4. **Complete** — Full response, input re-enabled
5. **Error** — Retry option

### Components
```
<AsyncResponse>
  ├── <ThinkingIndicator />    // "..." animation
  ├── <StreamingText />        // Word-by-word render
  └── <ErrorState />           // Retry button
</AsyncResponse>
```

---

## Test Plan

### Unit Tests
- [ ] URL extraction (Readability.js)
- [ ] Layer navigation state
- [ ] Breadcrumb generation
- [ ] Stream simulation

### Integration Tests
- [ ] Tap paragraph → layer transition
- [ ] Back navigation
- [ ] Theme switching
- [ ] Responsive layout (mobile ↔ desktop)

### E2E Tests (Playwright)
- [ ] Full flow: paste URL → read → tap → ask → response
- [ ] Mobile viewport
- [ ] Desktop viewport

### Manual Testing
- [ ] Eye strain check (15 min reading sessions)
- [ ] Gesture feel on real device
- [ ] Font readability at different sizes

---

## Build Phases

### Phase 1: Foundation (Today)
- [x] Next.js 14 setup
- [ ] Tailwind config with custom theme
- [ ] Zustand store skeleton
- [ ] Basic responsive layout
- [ ] Typography system

### Phase 2: Reader View
- [ ] URL input
- [ ] Readability.js extraction
- [ ] Clean article display
- [ ] Paragraph hover states
- [ ] Light/dark theme toggle

### Phase 3: Layers Navigation
- [ ] Layer stack state (Zustand)
- [ ] Tap paragraph → detail layer
- [ ] Slide transition animation
- [ ] Breadcrumb component
- [ ] Back gesture/button

### Phase 4: Async Mock AI
- [ ] Input field on detail layer
- [ ] Streaming text simulation
- [ ] Loading states
- [ ] Response display
- [ ] Delay configuration

### Phase 5: Polish
- [ ] Mobile optimizations
- [ ] Desktop sidebar variant?
- [ ] Keyboard shortcuts
- [ ] Progress indicator

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # URL input
│   └── read/
│       └── page.tsx          # Reader + layers
├── components/
│   ├── reader/
│   │   ├── article-view.tsx
│   │   ├── paragraph.tsx
│   │   └── breadcrumb.tsx
│   ├── layers/
│   │   ├── layer-stack.tsx
│   │   └── detail-layer.tsx
│   └── async/
│       ├── streaming-text.tsx
│       ├── thinking-indicator.tsx
│       └── async-response.tsx
├── stores/
│   ├── reader-store.ts
│   ├── layer-store.ts
│   └── theme-store.ts
├── lib/
│   ├── readability.ts
│   ├── stream-simulator.ts
│   └── utils.ts
└── styles/
    └── globals.css
```

---

## Next Action

Start building Phase 1 with Claude Code in plan mode.
