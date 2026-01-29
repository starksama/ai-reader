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
      const menuWidth = isMobile ? window.innerWidth - 32 : 200;
      const menuHeight = 120;
      
      let x: number;
      let y: number;
      let isBelow = false;

      if (isMobile) {
        // On mobile, center horizontally and position below selection
        x = 16;
        y = rect.bottom + 12;
        isBelow = true;
        
        // If too close to bottom, show above
        if (y + menuHeight > window.innerHeight - 20) {
          y = rect.top - menuHeight - 12;
          isBelow = false;
        }
      } else {
        // On desktop, position above selection centered
        x = rect.left + rect.width / 2 - menuWidth / 2;
        y = rect.top - menuHeight - 8;
        
        // Keep within viewport
        const padding = 12;
        if (x < padding) x = padding;
        if (x + menuWidth > window.innerWidth - padding) {
          x = window.innerWidth - menuWidth - padding;
        }
        
        // Show below if not enough space above
        if (y < padding) {
          y = rect.bottom + 12;
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
          initial={{ opacity: 0, y: position.isBelow ? -8 : 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: position.isBelow ? -8 : 8, scale: 0.96 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="fixed z-50"
          style={{ 
            left: position.x, 
            top: position.y,
            width: isMobile ? 'calc(100% - 32px)' : 'auto',
          }}
        >
          <div 
            className="rounded-2xl shadow-2xl overflow-hidden"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
            }}
          >
            {/* Selected text preview */}
            <div 
              className="px-4 py-3 border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                Selected text
              </p>
              <p 
                className="text-sm font-medium line-clamp-2"
                style={{ color: 'var(--text-primary)' }}
              >
                "{selection.text}"
              </p>
            </div>

            {/* Actions */}
            <div className="p-2 flex gap-2">
              <button
                onClick={handleDiveDeeper}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-white transition-all active:scale-98"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                <span>🔍</span>
                <span>Dive Deeper</span>
              </button>
              
              <button
                onClick={handleCopy}
                className="px-4 py-3 rounded-xl text-sm transition-all active:scale-98"
                style={{ 
                  backgroundColor: 'var(--highlight)',
                  color: 'var(--text-secondary)',
                }}
              >
                {copied ? '✓' : '📋'}
              </button>

              <button
                onClick={onClear}
                className="px-4 py-3 rounded-xl text-sm transition-all active:scale-98"
                style={{ 
                  backgroundColor: 'var(--highlight)',
                  color: 'var(--text-secondary)',
                }}
              >
                ✕
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
