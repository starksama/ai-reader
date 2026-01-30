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
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // Check for touch device
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isTouchDevice && isSmallScreen);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Show/hide menu based on selection state
  // On mobile, we wait for native selection menu to appear first, then show our bottom sheet
  // User can dismiss native menu and use our actions, or use native copy then our sheet
  useEffect(() => {
    if (selection.text && selection.paragraphIndex !== null) {
      if (isMobile) {
        // On mobile, show after native menu has time to appear
        // User will see native menu first, then our bottom sheet slides up
        const timer = setTimeout(() => setShowMenu(true), 100);
        return () => clearTimeout(timer);
      } else {
        // Desktop: show immediately
        queueMicrotask(() => setShowMenu(true));
      }
    } else {
      queueMicrotask(() => setShowMenu(false));
    }
  }, [selection.text, selection.paragraphIndex, isMobile]);

  // Position calculation requires reading DOM state after selection changes
  useEffect(() => {
    if (selection.range && !isMobile) {
      const rect = selection.range.getBoundingClientRect();
      const menuWidth = 300;
      const menuHeight = 60;
      
      let x = rect.left + rect.width / 2 - menuWidth / 2;
      let y = rect.top - menuHeight - 8;
      
      const padding = 12;
      if (x < padding) x = padding;
      if (x + menuWidth > window.innerWidth - padding) {
        x = window.innerWidth - menuWidth - padding;
      }
      if (y < padding) {
        y = rect.bottom + 8;
      }

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPosition({ x, y });
    }
  }, [selection.range, isMobile]);

  // Close on scroll (desktop only)
  useEffect(() => {
    if (!showMenu || isMobile) return;
    const handleScroll = () => onClear();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showMenu, isMobile, onClear]);

  const show = showMenu && selection.text.length > 0 && selection.paragraphIndex !== null;

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

  // Mobile: Bottom sheet style
  if (isMobile) {
    return (
      <AnimatePresence>
        {show && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={onClear}
            />
            
            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderTop: '1px solid var(--border)',
              }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-2 pb-1">
                <div 
                  className="w-10 h-1 rounded-md"
                  style={{ backgroundColor: 'var(--border)' }}
                />
              </div>

              {/* Selected text preview */}
              <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Selected text
                </p>
                <p 
                  className="text-sm mt-1 line-clamp-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  &ldquo;{selection.text}&rdquo;
                </p>
              </div>

              {/* Actions */}
              <div className="p-2 grid grid-cols-4 gap-1">
                <button
                  onClick={handleDiveDeeper}
                  className="flex flex-col items-center gap-1.5 py-3 transition-colors active:bg-[var(--highlight)]"
                  style={{ color: 'var(--accent)' }}
                >
                  <ArrowUpRight size={20} />
                  <span className="text-xs">Dive deeper</span>
                </button>
                
                <button
                  onClick={handleHighlight}
                  className="flex flex-col items-center gap-1.5 py-3 transition-colors active:bg-[var(--highlight)]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <Highlighter size={20} />
                  <span className="text-xs">Highlight</span>
                </button>
                
                <button
                  onClick={handleCopy}
                  className="flex flex-col items-center gap-1.5 py-3 transition-colors active:bg-[var(--highlight)]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <Copy size={20} />
                  <span className="text-xs">{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={onClear}
                  className="flex flex-col items-center gap-1.5 py-3 transition-colors active:bg-[var(--highlight)]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <X size={20} />
                  <span className="text-xs">Cancel</span>
                </button>
              </div>
              
              {/* Safe area padding for iOS */}
              <div className="h-6" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop: Floating menu
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.1 }}
          className="fixed z-50"
          style={{ left: position.x, top: position.y }}
        >
          <div 
            className="flex items-stretch shadow-lg rounded-md"
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
