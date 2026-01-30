# Mull Architecture v2 — First Principles

## Core Insight

**Any message can branch.**

Not "branches contain messages." The tree IS the messages.

---

## The Simplest Model

```
┌─────────────────────────────────────────────────────────────────┐
│                          messages                                │
├─────────────────────────────────────────────────────────────────┤
│ id                UUID PRIMARY KEY                              │
│ parent_id         UUID REFERENCES messages (nullable)           │
│ user_id           UUID REFERENCES users                         │
│ role              TEXT  -- 'user' | 'assistant' | 'system'      │
│ content           TEXT                                          │
│ source_id         UUID REFERENCES sources (nullable)            │
│ source_selection  JSONB -- { paragraphIndex, text, offsets }    │
│ created_at        TIMESTAMP                                     │
│ tokens_used       INT                                           │
│ model             TEXT                                          │
└─────────────────────────────────────────────────────────────────┘
```

**That's it.** The tree structure emerges from `parent_id`.

---

## How It Works

### Starting with a source (article/paste)

```
[Source: "Article about entropy"]
    │
    └── User: "What does entropy mean here?" (parent_id=null, source_id=X)
            │
            └── Assistant: "Entropy is..." (parent_id=above)
                    │
                    ├── User: "How does Shannon relate?" (parent_id=above) ← BRANCH A
                    │       │
                    │       └── Assistant: "Shannon defined..."
                    │               │
                    │               └── User: "Give me an example" (deeper)
                    │
                    └── User: "Explain paragraph 5" (parent_id=assistant) ← BRANCH B
                            │                         (clean context!)
                            └── Assistant: "Paragraph 5 says..."
```

### Starting with just a question (no source)

```
User: "Explain quantum computing" (parent_id=null, source_id=null)
    │
    └── Assistant: "Quantum computing uses..."
            │
            ├── User: "What are qubits?" ← BRANCH
            │       └── ...
            │
            └── User: "Who invented it?" ← BRANCH
                    └── ...
```

---

## Key Principles

### 1. No separate "branches" table
The tree IS the messages. `parent_id` creates the structure.

### 2. Sources are optional
A source is just content you might reference. You can start without one.

### 3. Infinite depth
Any message can have children. Go as deep as you want.

### 4. Context = path to root
To get context for a message, walk up `parent_id` until null.

### 5. A "conversation" is a view
It's just the path from a leaf to the root. The UI decides what to show.

---

## Queries

### Get conversation context (for AI)
```sql
WITH RECURSIVE context AS (
  -- Start from current message
  SELECT * FROM messages WHERE id = $current_message_id
  UNION ALL
  -- Walk up the tree
  SELECT m.* FROM messages m
  JOIN context c ON m.id = c.parent_id
)
SELECT * FROM context ORDER BY created_at ASC;
```

### Get all branches from a message
```sql
SELECT * FROM messages 
WHERE parent_id = $message_id 
ORDER BY created_at ASC;
```

### Get root conversations for a user
```sql
SELECT * FROM messages 
WHERE user_id = $user_id AND parent_id IS NULL 
ORDER BY created_at DESC;
```

### Get root conversations for a source
```sql
SELECT * FROM messages 
WHERE source_id = $source_id AND parent_id IS NULL 
ORDER BY created_at ASC;
```

---

## Full Schema

```sql
-- Users (unchanged)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_id TEXT UNIQUE,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT now(),
  last_seen_at TIMESTAMP DEFAULT now()
);

-- Sources (optional content)
CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'url', 'paste', 'markdown'
  title TEXT,
  url TEXT,
  raw_content TEXT,
  parsed_content JSONB, -- { paragraphs: [...] }
  word_count INT,
  created_at TIMESTAMP DEFAULT now(),
  last_opened_at TIMESTAMP DEFAULT now()
);

-- Messages (THE core table)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES messages ON DELETE CASCADE,
  user_id UUID REFERENCES users ON DELETE CASCADE,
  source_id UUID REFERENCES sources ON DELETE SET NULL,
  source_selection JSONB, -- { paragraphIndex, text, startOffset, endOffset }
  role TEXT NOT NULL, -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  tokens_used INT DEFAULT 0,
  model TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Highlights (annotations on sources)
CREATE TABLE highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES sources ON DELETE CASCADE,
  user_id UUID REFERENCES users ON DELETE CASCADE,
  paragraph_index INT,
  text TEXT,
  start_offset INT,
  end_offset INT,
  color TEXT DEFAULT 'green',
  note TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Indexes
CREATE INDEX idx_messages_parent ON messages(parent_id);
CREATE INDEX idx_messages_user ON messages(user_id, created_at DESC);
CREATE INDEX idx_messages_source ON messages(source_id, created_at ASC);
CREATE INDEX idx_sources_user ON sources(user_id, last_opened_at DESC);
```

---

## UI Implications

### "Current conversation" = path to root
When viewing a message, show the chain up to root.

### "Branch here" = create child message
Any message can be a branch point.

### "Go back" = move to parent
Pop up the tree.

### "See other branches" = sibling messages
Show other children of the same parent.

---

## Why This Is Better

| Old Model | New Model |
|-----------|-----------|
| Source → Branch → Message | Message (with optional source) |
| Branches are separate entities | Tree emerges from parent_id |
| Can't branch from AI response | Branch from any message |
| "Source" required | Start with just a question |
| Fixed depth | Infinite depth |
| Complex queries | Simple recursive CTE |

---

## Migration from v1

The old `branches` and separate message tables collapse into one.

1. Keep `sources` as-is
2. Flatten branches + messages into `messages` with `parent_id`
3. Delete `branches` table
4. Done

---

## Decision Log

**2026-01-30**: Simplified from Source→Branch→Message to just Messages with parent_id.
- Insight: Any message should be branchable
- Insight: Sources are optional, not required
- This enables "start with a question" flow naturally
