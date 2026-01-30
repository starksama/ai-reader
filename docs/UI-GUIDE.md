# Mull — UI Guide

Quick reference for styling and components.

---

## Color System

```css
/* Light Mode */
--bg-primary: #fafafa
--bg-secondary: #ffffff
--text-primary: #171717
--text-secondary: #525252
--accent: #166534 (green)
--highlight: rgba(22, 101, 52, 0.06)
--border: #e5e5e5

/* Dark Mode */
--bg-primary: #0a0a0a
--bg-secondary: #171717
--text-primary: #fafafa
--text-secondary: #a3a3a3
--accent: #22c55e
--highlight: rgba(34, 197, 94, 0.08)
--border: #262626
```

---

## Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Reading content | Source Serif 4 | 17-20px | 400 |
| UI text | Inter | 12-14px | 400-500 |
| Headings | Inter | 20-32px | 600 |

---

## Spacing

- **Container max-width:** 640px
- **Horizontal padding:** 24px
- **Paragraph margin:** 1.25em

---

## Components

### Action Menu
Single component for all interactions (selection, paragraph click, highlight).
- **Mobile:** Bottom sheet (slides up)
- **Desktop:** Floating menu near click

### Paragraph
- Border-left indicates explored state
- Hover shows subtle highlight
- Click opens action menu

### Highlights
Muted, theme-aware colors:
- Green (default): `rgba(76, 140, 87, 0.28)`
- Yellow, blue, pink, orange variants
- Lower opacity in dark mode

---

## Animation

| Type | Duration | Easing |
|------|----------|--------|
| Menu appear | 100-150ms | ease-out |
| Page transition | 200ms | ease-in-out |
| Expand/collapse | 200ms | ease |

---

## Z-Index

| Element | Z-Index |
|---------|---------|
| Progress bar | 50 |
| Top bar | 40 |
| Action menu | 50 |
| Toast | 50 |
| Modal | 60 |

---

## Focus States

**Removed all focus outlines.** Using hover/active states instead.
Buttons and inputs have `outline: none` globally.
