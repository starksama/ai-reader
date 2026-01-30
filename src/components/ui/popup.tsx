'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  position?: 'center' | 'top-right' | 'bottom';
}

export function Popup({ isOpen, onClose, title, children, position = 'center' }: PopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    // Delay to prevent immediate close
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 10);
    
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const positionClasses = {
    'center': 'fixed inset-0 flex items-center justify-center p-4',
    'top-right': 'fixed top-14 right-4',
    'bottom': 'fixed bottom-0 left-0 right-0',
  };

  const motionProps = {
    'center': {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
    },
    'top-right': {
      initial: { opacity: 0, y: -8 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -8 },
    },
    'bottom': {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Popup */}
          <div className={`${positionClasses[position]} z-50`}>
            <motion.div
              ref={popupRef}
              {...motionProps[position]}
              transition={{ duration: 0.15 }}
              className="w-full max-w-sm rounded-xl shadow-xl overflow-hidden"
              style={{ 
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              {/* Header */}
              {title && (
                <div 
                  className="flex items-center justify-between px-4 py-3 border-b"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <h3 
                    className="font-medium text-sm"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {title}
                  </h3>
                  <button
                    onClick={onClose}
                    className="p-1 rounded-md transition-colors hover:bg-[var(--bg-tertiary)]"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              
              {/* Content */}
              <div className="p-4">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
