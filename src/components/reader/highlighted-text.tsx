'use client';

import { useCallback, useMemo } from 'react';
import type { Highlight } from '@/stores/highlight-store';
import { useThemeStore, getHighlightColor } from '@/stores/theme-store';

interface HighlightedTextProps {
  text: string;
  highlights: Highlight[];
  onHighlightClick: (highlight: Highlight, position: { x: number; y: number }) => void;
}

export function HighlightedText({ 
  text, 
  highlights,
  onHighlightClick,
}: HighlightedTextProps) {
  const { theme, highlightColor } = useThemeStore();
  const bgColor = getHighlightColor(theme, highlightColor);

  // Must call all hooks before any conditional returns
  const handleHighlightClick = useCallback((e: React.MouseEvent, highlight: Highlight) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    // Position below the highlight, centered
    onHighlightClick(highlight, { 
      x: rect.left + rect.width / 2, 
      y: rect.bottom + 8 
    });
  }, [onHighlightClick]);

  // Build segments of text with highlights
  const segments = useMemo(() => {
    if (highlights.length === 0) return null;

    // Sort highlights by their position in text
    const sortedHighlights = [...highlights].sort((a, b) => {
      const aIndex = text.indexOf(a.text);
      const bIndex = text.indexOf(b.text);
      return aIndex - bIndex;
    });

    const result: Array<{ text: string; highlight?: Highlight }> = [];
    let lastIndex = 0;

    for (const highlight of sortedHighlights) {
      const startIndex = text.indexOf(highlight.text, lastIndex);
      if (startIndex === -1) continue;

      // Add non-highlighted text before this highlight
      if (startIndex > lastIndex) {
        result.push({ text: text.slice(lastIndex, startIndex) });
      }

      // Add highlighted text
      result.push({ text: highlight.text, highlight });
      lastIndex = startIndex + highlight.text.length;
    }

    // Add remaining text after last highlight
    if (lastIndex < text.length) {
      result.push({ text: text.slice(lastIndex) });
    }

    return result;
  }, [text, highlights]);

  // If no highlights, just return the text
  if (!segments) {
    return <>{text}</>;
  }

  return (
    <>
      {segments.map((segment, i) => 
        segment.highlight ? (
          <mark
            key={i}
            onClick={(e) => handleHighlightClick(e, segment.highlight!)}
            className="cursor-pointer px-0.5 -mx-0.5 rounded transition-all hover:opacity-80"
            style={{ 
              backgroundColor: bgColor,
              color: 'inherit',
            }}
          >
            {segment.text}
          </mark>
        ) : (
          <span key={i}>{segment.text}</span>
        )
      )}
    </>
  );
}
