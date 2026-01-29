'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Copy, X } from 'lucide-react';

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

  useEffect(() => {
    if (isOpen && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const padding = 16;
      
      let x = position.x;
      let y = position.y;

      if (x + rect.width > window.innerWidth - padding) {
        x = window.innerWidth - rect.width - padding;
      }
      if (x < padding) x = padding;
      if (y + rect.height > window.innerHeight - padding) {
        y = position.y - rect.height - 20;
      }
      if (y < padding) y = padding;

      setAdjustedPosition({ x, y });
    }
  }, [isOpen, position]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    setTimeout(() => {
      document.addEventListener('click', handleClick);
    }, 10);

    return () => document.removeEventListener('click', handleClick);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Close on scroll
  useEffect(() => {
    if (!isOpen) return;
    const handleScroll = () => onClose();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen, onClose]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(paragraphText);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      onClose();
    }, 600);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.1 }}
          className="fixed z-50"
          style={{ left: adjustedPosition.x, top: adjustedPosition.y }}
        >
          <div
            className="shadow-lg overflow-hidden min-w-[160px] rounded-sm"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
            }}
          >
            <div className="py-1">
              <button
                onClick={onDiveDeeper}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--highlight)] text-left"
                style={{ color: 'var(--accent)' }}
              >
                <ArrowUpRight size={14} />
                <span>Dive deeper</span>
              </button>

              <button
                onClick={handleCopy}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-[var(--highlight)] text-left"
                style={{ color: 'var(--text-secondary)' }}
              >
                <Copy size={14} />
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <div className="my-1 mx-3" style={{ height: 1, backgroundColor: 'var(--border)' }} />

              <button
                onClick={onClose}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-[var(--highlight)] text-left"
                style={{ color: 'var(--text-secondary)' }}
              >
                <X size={14} />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
