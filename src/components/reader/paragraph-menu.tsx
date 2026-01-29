'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ParagraphMenuProps {
  isOpen: boolean;
  paragraphIndex: number;
  paragraphText: string;
  position: { x: number; y: number };
  onDiveDeeper: () => void;
  onCopy: () => void;
  onClose: () => void;
}

export function ParagraphMenu({
  isOpen,
  paragraphIndex,
  paragraphText,
  position,
  onDiveDeeper,
  onCopy,
  onClose,
}: ParagraphMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  // Adjust position to stay in viewport
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const padding = 16;
      
      let x = position.x;
      let y = position.y;

      // Keep within horizontal bounds
      if (x + rect.width > window.innerWidth - padding) {
        x = window.innerWidth - rect.width - padding;
      }
      if (x < padding) x = padding;

      // Keep within vertical bounds
      if (y + rect.height > window.innerHeight - padding) {
        y = position.y - rect.height - 20;
      }
      if (y < padding) y = padding;

      setAdjustedPosition({ x, y });
    }
  }, [isOpen, position]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    // Delay to prevent immediate close
    setTimeout(() => {
      document.addEventListener('click', handleClick);
    }, 10);

    return () => document.removeEventListener('click', handleClick);
  }, [isOpen, onClose]);

  // Close on escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(paragraphText);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      onClose();
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95, y: -5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -5 }}
          transition={{ duration: 0.15 }}
          className="fixed z-50"
          style={{ left: adjustedPosition.x, top: adjustedPosition.y }}
        >
          <div
            className="rounded-2xl shadow-2xl overflow-hidden min-w-[200px]"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
            }}
          >
            {/* Header */}
            <div 
              className="px-4 py-3 border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Paragraph {paragraphIndex + 1}
              </p>
            </div>

            {/* Actions */}
            <div className="p-2">
              <button
                onClick={onDiveDeeper}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-[var(--highlight)]"
                style={{ color: 'var(--text-primary)' }}
              >
                <span>🔍</span>
                <span>Dive Deeper</span>
              </button>

              <button
                onClick={handleCopy}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-[var(--highlight)]"
                style={{ color: 'var(--text-secondary)' }}
              >
                <span>{copied ? '✓' : '📋'}</span>
                <span>{copied ? 'Copied!' : 'Copy paragraph'}</span>
              </button>

              <button
                onClick={onClose}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-[var(--highlight)]"
                style={{ color: 'var(--text-secondary)' }}
              >
                <span>✕</span>
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
