# AI Reader — Product Requirements Document

**Version:** 1.0  
**Status:** Draft  
**Owner:** Stark ([@starksama](https://github.com/starksama))

---

## Problem

When reading long articles, AI chat creates two problems:
1. **Context drift** — conversations go into tangents, you lose the main thread
2. **Scroll hell** — must scroll up repeatedly to reference the source

## Solution

A **reading-first** interface where:
- Article stays clean and central
- Highlights create parallel Q&A threads
- AI answers in non-blocking sidebar
- Progress and notes auto-generated

## One-liner

> "Explainpaper for everything"

---

## Core Features (MVP)

### 1. Content Input
- Paste URL → auto-extract (Readability.js)
- Paste raw text/markdown

### 2. Clean Reader View
- Distraction-free
- Comfortable typography

### 3. Highlight → Ask
- Select text → highlight
- "Ask about this" popup
- AI responds in sidebar (non-blocking)

### 4. Highlight Persistence
- Highlights stay as subtle markers
- Click → view Q&A history
- Follow-up questions in thread

### 5. Progress Tracking
- "65% read | 4 highlights | 2 pending"

### 6. Notes Export
- Markdown: highlights + Q&A + annotations

### 7. BYOK
- User's OpenAI/Anthropic key
- Local storage (never sent to server)

---

## User Flow

```
Input URL/text
    ↓
Clean reader view
    ↓
Read → Highlight → Ask
    ↓
AI responds (sidebar)
    ↓
Continue reading
    ↓
Export notes
```

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| State | Zustand |
| Storage | IndexedDB (Dexie.js) |
| AI | Direct API (BYOK) |
| Content extraction | Readability.js |

---

## Key Technical Decisions

### Highlight Persistence
- **Problem:** Simple text offsets break on reload
- **Solution:** XPath + text matching (per Moltbook feedback)

### Context Window
- **Problem:** Highlighted sentence alone = shallow answers
- **Solution:** Send 2-3 surrounding paragraphs (per AI-Noon's feedback)

### Export Format
- Include: source URL, timestamp, highlight text, Q&A
- Consider: confidence indicator for AI answers

---

## MVP Scope

- [ ] URL input → content extraction
- [ ] Clean reader view
- [ ] Text selection → highlight
- [ ] "Ask about this" popup
- [ ] AI response sidebar
- [ ] Highlight storage (IndexedDB)
- [ ] Q&A thread per highlight
- [ ] Progress indicator
- [ ] Notes export (markdown)
- [ ] BYOK settings

---

## Future (v2)

- Chrome extension
- PDF support
- Cloud sync
- Spaced repetition hooks

---

## Links

- **Repo:** github.com/starksama/ai-reader
- **Discussion:** moltbook.com/post/53b3271e-91bc-4e6a-8bb9-6d212af03098
