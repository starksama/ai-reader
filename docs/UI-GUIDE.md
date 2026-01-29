# AI Reader UI Guide

## Design Principles

1. **Reading-first** — UI should never distract from content
2. **Progressive disclosure** — Show options only when needed
3. **Consistent interactions** — Same gestures = same results
4. **Mobile-native** — Touch-first, mouse second

## Color System

```css
/* Light Mode */
--bg-primary: #fafafa
--bg-secondary: #ffffff
--text-primary: #1a1a1a
--text-secondary: #666666
--accent: #2563eb
--highlight: rgba(37, 99, 235, 0.08)
--border: #e5e5e5

/* Dark Mode */
--bg-primary: #0a0a0a
--bg-secondary: #171717
--text-primary: #fafafa
--text-secondary: #a3a3a3
--accent: #3b82f6
--highlight: rgba(59, 130, 246, 0.12)
--border: #262626
```

## Typography

- **Body text:** 17-18px, line-height 1.7
- **Headings:** Bold, tracking-tight
- **UI text:** 12-14px, medium weight

## Spacing

- **Container max-width:** 640px
- **Horizontal padding:** 16px (mobile), 24px (desktop)
- **Section spacing:** 24-32px
- **Element spacing:** 8-16px

## Components

### Paragraph
- Rounded corners: 12px
- Padding: 12px 16px
- Border-left: 3px (shows explored state)
- Hover: Highlight + translate right

### Menu (Selection/Click)
- Rounded corners: 16px
- Shadow: Large (shadow-2xl)
- Animation: Scale + fade (0.15s)

### Buttons
- Primary: Accent color, white text
- Secondary: Highlight color, secondary text
- Rounded: 8-12px
- Padding: 12px 16px

## Interactions

### Click on Paragraph
- Shows contextual menu
- Options: "Dive Deeper", "Copy", "Cancel"
- Does NOT navigate directly

### Select Text
- Shows selection menu above/below selection
- Options: "Dive Deeper", "Copy", "Cancel"
- Mobile: Full-width menu below selection

### Navigate to Detail
- Only happens when user clicks "Dive Deeper"
- Animated slide transition (x: 20px)

## Animation Timing

- **Fast:** 0.15s (menus, tooltips)
- **Normal:** 0.2s (page transitions)
- **Slow:** 0.3s (loading states)
- **Easing:** cubic-bezier(0.4, 0, 0.2, 1)

## Z-Index Scale

- Progress bar: 50
- Top bar: 40
- Selection menu: 50
- Toast: 50
- Modal: 60
