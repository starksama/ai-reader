# AI Reader — Design System

**Status:** Research + Draft  
**Last Updated:** 2026-01-30

---

## Core Concept: Layers Navigation

Instead of a sidebar or tree view, use **horizontal layers** with swipe navigation.

```
┌─────────────────────────────────────────┐
│ Main Article                            │
│                                         │
│ [Paragraph 1]                           │
│ [Paragraph 2] ← tap                     │
│ [Paragraph 3]                           │
└─────────────────────────────────────────┘
              ↓ swipe right
┌─────────────────────────────────────────┐
│ ← main / paragraph-2                    │  ← breadcrumb
│                                         │
│ "The highlighted text..."               │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Ask about this paragraph...         │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [AI Response area - mocked for now]     │
│                                         │
└─────────────────────────────────────────┘
```

**Navigation:**
- Tap paragraph → slide right to detail layer
- Swipe left or tap breadcrumb → go back
- Breadcrumb: `main / thread-{n} / reply-{n}`
- Stack-based: can go multiple levels deep

---

## Typography

### Primary Reading Font
**Option A:** Inter (clean, modern, free)
**Option B:** Literata (designed for reading, Google Fonts)
**Option C:** Charter / Georgia (classic serif, proven readability)

### Specifications
| Element | Size | Line Height | Weight |
|---------|------|-------------|--------|
| Body text | 18-20px | 1.6-1.8 | 400 |
| Headings | 24-32px | 1.3 | 600 |
| Captions | 14px | 1.5 | 400 |
| Breadcrumb | 14px | 1.4 | 500 |

### Line Length
- Optimal: 50-75 characters per line
- Max-width: ~680px for reading column

---

## Color Scheme

### Light Mode (Default)
```css
--bg-primary: #FAFAFA;      /* Warm white, less harsh */
--bg-secondary: #FFFFFF;
--text-primary: #1A1A1A;    /* Not pure black */
--text-secondary: #666666;
--accent: #2563EB;          /* Blue for interactive */
--highlight: #FEF3C7;       /* Warm yellow for highlights */
--border: #E5E5E5;
```

### Dark Mode
```css
--bg-primary: #1A1A1A;
--bg-secondary: #262626;
--text-primary: #E5E5E5;    /* Not pure white */
--text-secondary: #A3A3A3;
--accent: #60A5FA;
--highlight: #78350F;       /* Darker amber */
--border: #404040;
```

### Sepia Mode (Optional, great for reading)
```css
--bg-primary: #F4ECD8;
--text-primary: #5C4B37;
--accent: #8B5A2B;
```

---

## Spacing & Layout

### Reading Container
```css
.reader-container {
  max-width: 680px;
  margin: 0 auto;
  padding: 24px 20px;
}
```

### Paragraph Spacing
```css
.paragraph {
  margin-bottom: 1.5em;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background 0.15s ease;
}

.paragraph:hover {
  background: var(--highlight);
  cursor: pointer;
}

.paragraph.selected {
  background: var(--highlight);
  border-left: 3px solid var(--accent);
}
```

---

## Transitions & Animations

### Layer Slide
```css
/* Slide in from right */
.layer-enter {
  transform: translateX(100%);
}
.layer-enter-active {
  transform: translateX(0);
  transition: transform 300ms ease-out;
}

/* Slide out to right */
.layer-exit-active {
  transform: translateX(100%);
  transition: transform 250ms ease-in;
}
```

### Timing
- Layer transition: 250-300ms
- Hover states: 150ms
- Focus states: 100ms

---

## Components

### 1. Breadcrumb
```
← main / paragraph-2 / reply-1
```
- Tappable segments
- Current segment bold
- Back arrow always visible

### 2. Paragraph Block
- Subtle hover state
- Tap → transitions to detail layer
- Previously visited = subtle indicator

### 3. Detail Layer
- Full-screen on mobile
- Quoted text at top
- AI input below
- Response area (mocked)

### 4. Progress Bar (v2)
- Thin bar at top
- Shows: % read, # highlights, # pending

---

## Apps to Study

| App | What to Learn |
|-----|---------------|
| **Readwise Reader** | Highlight UX, reader mode |
| **Matter** | Typography, gestures |
| **Instapaper** | Clean reading, dark mode |
| **Apple Books** | Page transitions, sepia mode |
| **Arc Browser** | Spaces/layers concept |
| **Linear** | Breadcrumb navigation |

---

## Roadmap

### Phase 1: Static Reader (Week 1)
- [ ] Clean reader view with good typography
- [ ] URL → content extraction (Readability.js)
- [ ] Light/dark/sepia themes
- [ ] Paragraph hover states

### Phase 2: Layers Navigation (Week 2)
- [ ] Tap paragraph → slide to detail layer
- [ ] Breadcrumb navigation
- [ ] Back gesture/button
- [ ] Layer stack management

### Phase 3: Mock AI (Week 3)
- [ ] Input field on detail layer
- [ ] Mock AI responses (static or random)
- [ ] Response display

### Phase 4: Real AI + Storage (Week 4)
- [ ] BYOK settings
- [ ] Real API calls
- [ ] IndexedDB persistence
- [ ] Export notes

---

## Open Questions (for Anton)

1. **Mobile-first or desktop-first?** The layers concept feels very mobile-native.
2. **Sepia mode priority?** Some readers swear by it.
3. **Font preference?** Serif (traditional) vs sans-serif (modern)?
4. **Breadcrumb style?** Minimal (`← main / p-2`) or verbose (`← Article / Paragraph 2`)?

---

*This is a living document. Will update as we iterate.*
