'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Pencil, Trash2, X } from 'lucide-react';
import type { Highlight } from '@/stores/highlight-store';

interface HighlightedTextProps {
  text: string;
  highlights: Highlight[];
  onDiveDeeper: (text: string) => void;
  onEditHighlight: (highlight: Highlight) => void;
  onDeleteHighlight: (highlightId: string) => void;
}

export function HighlightedText({ 
  text, 
  highlights, 
  onDiveDeeper, 
  onEditHighlight,
  onDeleteHighlight 
}: HighlightedTextProps) {
  const [activeHighlight, setActiveHighlight] = useState<Highlight | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  // If no highlights, just return the text
  if (highlights.length === 0) {
    return <>{text}</>;
  }

  // Sort highlights by their position in text
  const sortedHighlights = [...highlights].sort((a, b) => {
    const aIndex = text.indexOf(a.text);
    const bIndex = text.indexOf(b.text);
    return aIndex - bIndex;
  });

  // Build segments of text with highlights
  const segments: Array<{ text: string; highlight?: Highlight }> = [];
  let lastIndex = 0;

  for (const highlight of sortedHighlights) {
    const startIndex = text.indexOf(highlight.text, lastIndex);
    if (startIndex === -1) continue;

    // Add non-highlighted text before this highlight
    if (startIndex > lastIndex) {
      segments.push({ text: text.slice(lastIndex, startIndex) });
    }

    // Add highlighted text
    segments.push({ text: highlight.text, highlight });
    lastIndex = startIndex + highlight.text.length;
  }

  // Add remaining text after last highlight
  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex) });
  }

  const handleHighlightClick = (e: React.MouseEvent, highlight: Highlight) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setMenuPosition({ 
      x: rect.left + rect.width / 2, 
      y: rect.bottom + 8 
    });
    setActiveHighlight(highlight);
  };

  const closeMenu = () => setActiveHighlight(null);

  return (
    <>
      {segments.map((segment, i) => 
        segment.highlight ? (
          <mark
            key={i}
            onClick={(e) => handleHighlightClick(e, segment.highlight!)}
            className="cursor-pointer px-0.5 -mx-0.5 rounded transition-all hover:opacity-80"
            style={{ 
              backgroundColor: 'var(--accent-subtle)',
              color: 'inherit',
            }}
          >
            {segment.text}
          </mark>
        ) : (
          <span key={i}>{segment.text}</span>
        )
      )}

      {/* Highlight Menu */}
      <AnimatePresence>
        {activeHighlight && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={closeMenu}
            />
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="fixed z-50 shadow-lg rounded-md overflow-hidden"
              style={{ 
                left: menuPosition.x,
                top: menuPosition.y,
                transform: 'translateX(-50%)',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="flex">
                <button
                  onClick={() => {
                    onDiveDeeper(activeHighlight.text);
                    closeMenu();
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-[var(--highlight)]"
                  style={{ color: 'var(--accent)' }}
                >
                  <ArrowUpRight size={14} />
                  <span>Dive deeper</span>
                </button>
                
                <div style={{ width: 1, backgroundColor: 'var(--border)' }} />
                
                <button
                  onClick={() => {
                    onEditHighlight(activeHighlight);
                    closeMenu();
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-[var(--highlight)]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <Pencil size={14} />
                  <span>Edit</span>
                </button>
                
                <div style={{ width: 1, backgroundColor: 'var(--border)' }} />
                
                <button
                  onClick={() => {
                    onDeleteHighlight(activeHighlight.id);
                    closeMenu();
                  }}
                  className="px-3 py-2 text-sm transition-colors hover:bg-[var(--highlight)]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
