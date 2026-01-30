'use client';

import { useState } from 'react';
import { Keyboard, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function KeyboardHints() {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    { key: 'Esc', action: 'Go back / close' },
    { key: '↑', action: 'Previous explored' },
    { key: '↓', action: 'Next explored' },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-8 h-8 flex items-center justify-center rounded-md transition-all"
        style={{
          backgroundColor: 'transparent',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border)',
        }}
        title="Keyboard shortcuts"
      >
        <Keyboard size={14} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] p-5 rounded-md shadow-xl"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 
                  className="font-medium text-sm"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Keyboard Shortcuts
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 transition-opacity hover:opacity-70"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-2">
                {shortcuts.map((s) => (
                  <div 
                    key={s.key}
                    className="flex items-center justify-between text-sm"
                  >
                    <kbd 
                      className="px-2 py-1 text-xs rounded-md font-mono"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {s.key}
                    </kbd>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {s.action}
                    </span>
                  </div>
                ))}
              </div>

              <p 
                className="text-xs mt-4 pt-3"
                style={{ 
                  color: 'var(--text-tertiary)',
                  borderTop: '1px solid var(--border)',
                }}
              >
                Works in detail view
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
