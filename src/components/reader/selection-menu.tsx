'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SelectionMenuProps {
  selection: {
    text: string;
    paragraphIndex: number | null;
    range: Range | null;
  };
  onDiveDeeper: (text: string, paragraphIndex: number) => void;
  onCopy: (text: string) => void;
  onClear: () => void;
}

export function SelectionMenu({ selection, onDiveDeeper, onCopy, onClear }: SelectionMenuProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (selection.range) {
      const rect = selection.range.getBoundingClientRect();
      const menuWidth = 240;
      
      // Position above the selection, centered
      let x = rect.left + rect.width / 2 - menuWidth / 2;
      let y = rect.top - 60;

      // Keep within viewport
      const padding = 12;
      if (x < padding) x = padding;
      if (x + menuWidth > window.innerWidth - padding) {
        x = window.innerWidth - menuWidth - padding;
      }
      if (y < padding) {
        // Show below if not enough space above
        y = rect.bottom + 12;
      }

      setPosition({ x, y });
    }
  }, [selection.range]);

  const show = selection.text.length > 0 && selection.paragraphIndex !== null;

  const handleDiveDeeper = () => {
    if (selection.paragraphIndex !== null) {
      onDiveDeeper(selection.text, selection.paragraphIndex);
      onClear();
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(selection.text);
    setCopied(true);
    onCopy(selection.text);
    setTimeout(() => {
      setCopied(false);
      onClear();
    }, 1000);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="fixed z-50"
          style={{ left: position.x, top: position.y }}
        >
          {/* Main menu */}
          <div 
            className="rounded-xl shadow-2xl overflow-hidden backdrop-blur-sm"
            style={{
              backgroundColor: 'rgba(var(--bg-primary-rgb), 0.95)',
              border: '1px solid var(--border)',
            }}
          >
            {/* Selected text preview */}
            <div 
              className="px-3 py-2 text-xs border-b"
              style={{ 
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              <span className="opacity-60">Selected:</span>{' '}
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                "{selection.text.slice(0, 40)}{selection.text.length > 40 ? '...' : ''}"
              </span>
            </div>

            {/* Actions */}
            <div className="p-1.5">
              <button
                onClick={handleDiveDeeper}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-[var(--highlight)]"
                style={{ color: 'var(--text-primary)' }}
              >
                <span className="text-base">🔍</span>
                <span>Dive Deeper</span>
              </button>
              
              <button
                onClick={handleCopy}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors hover:bg-[var(--highlight)]"
                style={{ color: 'var(--text-secondary)' }}
              >
                <span className="text-base">{copied ? '✓' : '📋'}</span>
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>

              <button
                onClick={onClear}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors hover:bg-[var(--highlight)]"
                style={{ color: 'var(--text-secondary)' }}
              >
                <span className="text-base">✕</span>
                <span>Cancel</span>
              </button>
            </div>
          </div>

          {/* Arrow pointing to selection */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rotate-45"
            style={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              borderTop: 'none',
              borderLeft: 'none',
              bottom: '-6px',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
