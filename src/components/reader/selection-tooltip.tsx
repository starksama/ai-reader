'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SelectionTooltipProps {
  selection: {
    text: string;
    paragraphIndex: number | null;
    range: Range | null;
  };
  onAskAbout: (text: string, paragraphIndex: number) => void;
  onClear: () => void;
}

export function SelectionTooltip({ selection, onAskAbout, onClear }: SelectionTooltipProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selection.range) {
      const rect = selection.range.getBoundingClientRect();
      const tooltipWidth = 160;
      
      // Position above the selection, centered
      let x = rect.left + rect.width / 2 - tooltipWidth / 2;
      let y = rect.top - 50;

      // Keep within viewport
      const padding = 10;
      if (x < padding) x = padding;
      if (x + tooltipWidth > window.innerWidth - padding) {
        x = window.innerWidth - tooltipWidth - padding;
      }
      if (y < padding) {
        // Show below if not enough space above
        y = rect.bottom + 10;
      }

      setPosition({ x, y });
    }
  }, [selection.range]);

  const show = selection.text.length > 0 && selection.paragraphIndex !== null;

  const handleAsk = () => {
    if (selection.paragraphIndex !== null) {
      onAskAbout(selection.text, selection.paragraphIndex);
      onClear();
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          ref={tooltipRef}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.15 }}
          className="fixed z-50 shadow-lg rounded-lg overflow-hidden"
          style={{
            left: position.x,
            top: position.y,
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border)',
          }}
        >
          <div className="flex">
            <button
              onClick={handleAsk}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors hover:bg-opacity-80"
              style={{ 
                backgroundColor: 'var(--accent)', 
                color: '#fff',
              }}
            >
              <span>✨</span>
              <span>Ask AI</span>
            </button>
            <button
              onClick={onClear}
              className="px-3 py-2 text-sm transition-colors"
              style={{ 
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-secondary)',
              }}
            >
              ✕
            </button>
          </div>
          <div 
            className="px-3 py-1.5 text-xs truncate max-w-[200px]"
            style={{ 
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
            }}
          >
            "{selection.text.slice(0, 50)}{selection.text.length > 50 ? '...' : ''}"
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
