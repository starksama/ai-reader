'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Highlighter, Copy, X, Pencil, Trash2 } from 'lucide-react';

export type ActionMenuMode = 'selection' | 'paragraph' | 'highlight';

interface ActionMenuProps {
  isOpen: boolean;
  mode: ActionMenuMode;
  text: string;
  position?: { x: number; y: number }; // For desktop floating menu
  isMobile?: boolean;
  
  // Actions
  onDiveDeeper: () => void;
  onHighlight?: () => void; // Not shown in highlight mode
  onCopy?: () => void;
  onEdit?: () => void; // Only for highlight mode
  onDelete?: () => void; // Only for highlight mode
  onClose: () => void;
}

export function ActionMenu({
  isOpen,
  mode,
  text,
  position = { x: 0, y: 0 },
  isMobile = false,
  onDiveDeeper,
  onHighlight,
  onCopy,
  onEdit,
  onDelete,
  onClose,
}: ActionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  // Position adjustment for desktop floating menu
  useEffect(() => {
    if (isOpen && !isMobile && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const padding = 16;
      
      let x = position.x;
      let y = position.y;

      // Horizontal bounds
      if (x + rect.width > window.innerWidth - padding) {
        x = window.innerWidth - rect.width - padding;
      }
      if (x < padding) x = padding;
      
      // Vertical bounds
      if (y + rect.height > window.innerHeight - padding) {
        y = position.y - rect.height - 20;
      }
      if (y < padding) y = padding;

      setAdjustedPosition({ x, y });
    }
  }, [isOpen, position, isMobile]);

  // Update position when props change
  useEffect(() => {
    if (!isMobile) {
      setAdjustedPosition(position);
    }
  }, [position, isMobile]);

  // Close on escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Close on scroll (desktop only)
  useEffect(() => {
    if (!isOpen || isMobile) return;
    const handleScroll = () => onClose();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen, isMobile, onClose]);

  const handleCopy = async () => {
    if (!onCopy) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    onCopy();
    setTimeout(() => {
      setCopied(false);
      onClose();
    }, 600);
  };

  const handleDiveDeeper = () => {
    onDiveDeeper();
    onClose();
  };

  const handleHighlight = () => {
    if (onHighlight) {
      onHighlight();
      onClose();
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
      onClose();
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      onClose();
    }
  };

  // Mobile: Bottom sheet style
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={onClose}
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
                  {mode === 'highlight' ? 'Highlighted text' : mode === 'paragraph' ? 'Paragraph' : 'Selected text'}
                </p>
                <p 
                  className="text-sm mt-1 line-clamp-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  &ldquo;{text}&rdquo;
                </p>
              </div>

              {/* Actions */}
              <div className={`p-2 grid gap-1 ${mode === 'highlight' ? 'grid-cols-4' : 'grid-cols-4'}`}>
                <button
                  onClick={handleDiveDeeper}
                  className="flex flex-col items-center gap-1.5 py-3 transition-colors active:bg-[var(--highlight)]"
                  style={{ color: 'var(--accent)' }}
                >
                  <ArrowUpRight size={20} />
                  <span className="text-xs">Dive deeper</span>
                </button>

                {mode === 'highlight' ? (
                  <>
                    <button
                      onClick={handleEdit}
                      className="flex flex-col items-center gap-1.5 py-3 transition-colors active:bg-[var(--highlight)]"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <Pencil size={20} />
                      <span className="text-xs">Edit</span>
                    </button>
                    
                    <button
                      onClick={handleDelete}
                      className="flex flex-col items-center gap-1.5 py-3 transition-colors active:bg-[var(--highlight)]"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <Trash2 size={20} />
                      <span className="text-xs">Delete</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleHighlight}
                      className="flex flex-col items-center gap-1.5 py-3 transition-colors active:bg-[var(--highlight)]"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <Highlighter size={20} />
                      <span className="text-xs">Highlight</span>
                    </button>
                    
                    {onCopy && (
                      <button
                        onClick={handleCopy}
                        className="flex flex-col items-center gap-1.5 py-3 transition-colors active:bg-[var(--highlight)]"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <Copy size={20} />
                        <span className="text-xs">{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </>
                )}

                <button
                  onClick={onClose}
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
      {isOpen && (
        <>
          {/* Invisible backdrop to catch clicks */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={onClose}
          />
          
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
              className="shadow-lg overflow-hidden rounded-md"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="flex items-stretch">
                <button
                  onClick={handleDiveDeeper}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--highlight)]"
                  style={{ color: 'var(--accent)' }}
                >
                  <ArrowUpRight size={14} />
                  <span>Dive deeper</span>
                </button>
                
                <div style={{ width: 1, backgroundColor: 'var(--border)' }} />

                {mode === 'highlight' ? (
                  <>
                    <button
                      onClick={handleEdit}
                      className="flex items-center gap-2 px-3 py-2.5 text-sm transition-colors hover:bg-[var(--highlight)]"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <Pencil size={14} />
                      <span>Edit</span>
                    </button>
                    
                    <div style={{ width: 1, backgroundColor: 'var(--border)' }} />
                    
                    <button
                      onClick={handleDelete}
                      className="px-3 py-2.5 text-sm transition-colors hover:bg-[var(--highlight)]"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleHighlight}
                      className="flex items-center gap-2 px-3 py-2.5 text-sm transition-colors hover:bg-[var(--highlight)]"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <Highlighter size={14} />
                      <span>Highlight</span>
                    </button>

                    {onCopy && (
                      <>
                        <div style={{ width: 1, backgroundColor: 'var(--border)' }} />
                        
                        <button
                          onClick={handleCopy}
                          className="flex items-center gap-2 px-3 py-2.5 text-sm transition-colors hover:bg-[var(--highlight)]"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          <Copy size={14} />
                          <span>{copied ? 'Copied' : 'Copy'}</span>
                        </button>
                      </>
                    )}
                  </>
                )}

                <div style={{ width: 1, backgroundColor: 'var(--border)' }} />

                <button
                  onClick={onClose}
                  className="px-3 py-2.5 text-sm transition-colors hover:bg-[var(--highlight)]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
