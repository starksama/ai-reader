'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Highlighter, Copy, X } from 'lucide-react';

interface SelectionMenuProps {
  selection: {
    text: string;
    paragraphIndex: number | null;
    range: Range | null;
  };
  onDiveDeeper: (text: string, paragraphIndex: number) => void;
  onHighlight: (text: string, paragraphIndex: number) => void;
  onCopy: (text: string) => void;
  onClear: () => void;
}

export function SelectionMenu({ 
  selection, 
  onDiveDeeper, 
  onHighlight,
  onCopy, 
  onClear 
}: SelectionMenuProps) {
  const [position, setPosition] = useState({ x: 0, y: 0, isBelow: false });
  const [isMobile, setIsMobile] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 640);
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (selection.range) {
      const rect = selection.range.getBoundingClientRect();
      const menuWidth = isMobile ? window.innerWidth - 32 : 280;
      const menuHeight = 80;
      
      let x: number;
      let y: number;
      let isBelow = false;

      if (isMobile) {
        x = 16;
        y = rect.bottom + 8;
        isBelow = true;
        if (y + menuHeight > window.innerHeight - 20) {
          y = rect.top - menuHeight - 8;
          isBelow = false;
        }
      } else {
        x = rect.left + rect.width / 2 - menuWidth / 2;
        y = rect.top - menuHeight - 8;
        const padding = 12;
        if (x < padding) x = padding;
        if (x + menuWidth > window.innerWidth - padding) {
          x = window.innerWidth - menuWidth - padding;
        }
        if (y < padding) {
          y = rect.bottom + 8;
          isBelow = true;
        }
      }

      setPosition({ x, y, isBelow });
    }
  }, [selection.range, isMobile]);

  const show = selection.text.length > 0 && selection.paragraphIndex !== null;

  const handleDiveDeeper = () => {
    if (selection.paragraphIndex !== null) {
      onDiveDeeper(selection.text, selection.paragraphIndex);
      onClear();
    }
  };

  const handleHighlight = () => {
    if (selection.paragraphIndex !== null) {
      onHighlight(selection.text, selection.paragraphIndex);
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
    }, 600);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: position.isBelow ? -4 : 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: position.isBelow ? -4 : 4 }}
          transition={{ duration: 0.1 }}
          className="fixed z-50"
          style={{ 
            left: position.x, 
            top: position.y,
            width: isMobile ? 'calc(100% - 32px)' : 'auto',
          }}
        >
          <div 
            className="flex items-stretch shadow-lg"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
            }}
          >
            <button
              onClick={handleDiveDeeper}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors hover:bg-[var(--highlight)]"
              style={{ color: 'var(--accent)' }}
            >
              <ArrowUpRight size={14} />
              <span>Dive deeper</span>
            </button>
            
            <div style={{ width: 1, backgroundColor: 'var(--border)' }} />
            
            <button
              onClick={handleHighlight}
              className="flex items-center gap-2 px-4 py-3 text-sm transition-colors hover:bg-[var(--highlight)]"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Highlighter size={14} />
              <span>Highlight</span>
            </button>

            <div style={{ width: 1, backgroundColor: 'var(--border)' }} />
            
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-3 text-sm transition-colors hover:bg-[var(--highlight)]"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Copy size={14} />
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <div style={{ width: 1, backgroundColor: 'var(--border)' }} />

            <button
              onClick={onClear}
              className="px-3 py-3 text-sm transition-colors hover:bg-[var(--highlight)]"
              style={{ color: 'var(--text-secondary)' }}
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
