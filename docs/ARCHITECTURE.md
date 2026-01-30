# Mull — Architecture & Data Model

## Overview

Mull needs to store **branching conversations** anchored to **source content**. Users should be able to:
- Resume learning sessions across devices
- Search/find old notes and insights
- Export their knowledge
- Pay based on actual AI usage

---

## Auth Strategy

**Simple Google OAuth → Supabase**

```
User clicks "Sign in with Google"
  → Google OAuth flow
  → Get Google user ID + email
  → Upsert into Supabase `users` table
  → Return session token
  → Store in localStorage/cookie
```

Why Google-only (for now):
- Lowest friction for users
- No password management
- Can add more providers later

---

## Data Model

### Core Entities

```
┌─────────────────────────────────────────────────────────────────┐
│                           users                                  │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PRIMARY KEY                                │
│ google_id       TEXT UNIQUE                                     │
│ email           TEXT                                            │
│ name            TEXT                                            │
│ avatar_url      TEXT                                            │
│ created_at      TIMESTAMP                                       │
│ last_seen_at    TIMESTAMP                                       │
│ settings        JSONB  -- theme, font size, preferences         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1:many
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          sources                                 │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PRIMARY KEY                                │
│ user_id         UUID REFERENCES users                           │
│ type            TEXT  -- 'url', 'paste', 'markdown', 'pdf'      │
│ title           TEXT                                            │
│ url             TEXT  -- null if pasted                         │
│ content_hash    TEXT  -- for deduplication                      │
│ raw_content     TEXT  -- original content                       │
│ parsed_content  JSONB -- { paragraphs: [...], metadata: {...} } │
│ word_count      INT                                             │
│ created_at      TIMESTAMP                                       │
│ last_opened_at  TIMESTAMP                                       │
│ archived        BOOLEAN DEFAULT false                           │
│ tags            TEXT[]  -- user tags for organization           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1:many
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          branches                                │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PRIMARY KEY                                │
│ source_id       UUID REFERENCES sources                         │
│ parent_id       UUID REFERENCES branches (nullable)             │
│ paragraph_index INT  -- which paragraph this branches from      │
│ selected_text   TEXT -- specific selection, if any              │
│ title           TEXT -- auto-generated or user-set              │
│ created_at      TIMESTAMP                                       │
│ updated_at      TIMESTAMP                                       │
│ is_resolved     BOOLEAN DEFAULT false -- user marked as "done"  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1:many
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          messages                                │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PRIMARY KEY                                │
│ branch_id       UUID REFERENCES branches                        │
│ role            TEXT  -- 'user', 'assistant', 'system'          │
│ content         TEXT                                            │
│ tokens_used     INT  -- for billing                             │
│ model           TEXT  -- 'gpt-4', 'claude-3', etc               │
│ created_at      TIMESTAMP                                       │
│ metadata        JSONB -- { latency_ms, stop_reason, etc }       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         highlights                               │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PRIMARY KEY                                │
│ source_id       UUID REFERENCES sources                         │
│ paragraph_index INT                                             │
│ start_offset    INT                                             │
│ end_offset      INT                                             │
│ text            TEXT  -- denormalized for easy display          │
│ color           TEXT  -- 'yellow', 'green', etc                 │
│ note            TEXT  -- optional user note                     │
│ created_at      TIMESTAMP                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        usage_logs                                │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PRIMARY KEY                                │
│ user_id         UUID REFERENCES users                           │
│ message_id      UUID REFERENCES messages                        │
│ model           TEXT                                            │
│ input_tokens    INT                                             │
│ output_tokens   INT                                             │
│ cost_usd        DECIMAL(10, 6)  -- actual cost                  │
│ created_at      TIMESTAMP                                       │
└─────────────────────────────────────────────────────────────────┘
```

### Relationships

```
User
 └── Sources (articles/content they've loaded)
      ├── Highlights (annotations on the source)
      └── Branches (conversation threads)
           └── Messages (chat history within branch)
```

---

## Future Compatibility

### Flexible Schema Patterns

1. **JSONB for extensibility** — `settings`, `metadata`, `parsed_content` can evolve without migrations

2. **Soft deletes** — `archived` flag instead of DELETE, preserves history

3. **Content versioning** — Store `content_hash` to detect if source changed

4. **Model-agnostic** — `model` field on messages, not hardcoded

### Indexes for Search

```sql
-- Find user's recent sources
CREATE INDEX idx_sources_user_last_opened 
  ON sources(user_id, last_opened_at DESC);

-- Full-text search on content
CREATE INDEX idx_sources_content_search 
  ON sources USING gin(to_tsvector('english', title || ' ' || raw_content));

-- Find branches by source
CREATE INDEX idx_branches_source 
  ON branches(source_id, created_at DESC);

-- Usage reporting
CREATE INDEX idx_usage_user_date 
  ON usage_logs(user_id, created_at DESC);
```

---

## LiteLLM Integration (Billing)

### Flow

```
User sends message
  → Mull backend receives request
  → Backend calls LiteLLM proxy with user's API key
  → LiteLLM routes to appropriate model
  → LiteLLM tracks usage per API key
  → Response returned to user
  → Mull logs usage for display (not billing)
```

### User Setup

1. User registers on Mull (Google OAuth)
2. User goes to Settings → "Get API Key"
3. Mull generates a unique LiteLLM API key for user
4. User's usage is tracked by LiteLLM
5. Billing happens through LiteLLM (prepaid credits or usage-based)

### API Key Storage

```sql
ALTER TABLE users ADD COLUMN litellm_api_key TEXT;
ALTER TABLE users ADD COLUMN litellm_key_created_at TIMESTAMP;
```

---

## Export Format

Users can export their learning in multiple formats:

### Markdown Export

```markdown
# [Article Title]

Source: https://example.com/article
Date: 2026-01-30
Words: 2,450

## Highlights

> "Important quote here"
— Paragraph 3

> "Another highlight"
Note: My thoughts on this...

## Conversations

### Branch: "What does entropy mean?"
**Me:** What does entropy mean in this context?
**AI:** Entropy here refers to...

#### Sub-branch: "Information theory connection"
**Me:** How does this relate to Shannon?
**AI:** Claude Shannon defined...

## Summary
[Auto-generated or user-written summary]
```

### JSON Export (for power users)

```json
{
  "source": { ... },
  "highlights": [ ... ],
  "branches": [ ... ],
  "exportedAt": "2026-01-30T10:00:00Z"
}
```

---

## Migration Path

### Phase 1: Local-first (current)
- All data in localStorage/IndexedDB
- No auth required
- Export to file

### Phase 2: Optional sync
- Add Google auth
- Sync to Supabase when logged in
- Local-first still works offline

### Phase 3: Full cloud
- LiteLLM integration for AI
- Usage tracking and billing
- Team features (shared sources)

---

## Supabase Setup Checklist

- [ ] Create project
- [ ] Enable Google OAuth provider
- [ ] Create tables (see schema above)
- [ ] Set up Row Level Security (RLS)
- [ ] Create API functions for complex queries
- [ ] Set up realtime subscriptions (optional)

---

## Environment Variables (Phase 2+)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...  # server-side only

# LiteLLM
LITELLM_API_BASE=https://your-litellm-instance.com
LITELLM_MASTER_KEY=sk-...  # for creating user keys

# Optional
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
```
