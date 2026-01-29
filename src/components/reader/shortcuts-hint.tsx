'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function ShortcutsHint() {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    { key: 'Click', desc: 'Open paragraph details' },
    { key: 'Select text', desc: 'Ask about selection' },
    { key: 'Esc', desc: 'Go back' },
    { key: '↑ / k', desc: 'Previous paragraph' },
    { key: '↓ / j', desc: 'Next paragraph' },
    { key: 'Swipe right', desc: 'Go back (mobile)' },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-12 right-0 p-4 rounded-lg shadow-lg mb-2 min-w-[200px]"
            style={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border)',
            }}
          >
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Keyboard Shortcuts
            </h3>
            <div className="space-y-2">
              {shortcuts.map((s) => (
                <div key={s.key} className="flex justify-between gap-4 text-sm">
                  <span 
                    className="font-mono px-1.5 py-0.5 rounded text-xs"
                    style={{ 
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {s.key}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>{s.desc}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
        style={{
          backgroundColor: isOpen ? 'var(--accent)' : 'var(--bg-secondary)',
          color: isOpen ? '#fff' : 'var(--text-secondary)',
        }}
        title="Keyboard shortcuts"
      >
        ⌨️
      </button>
    </div>
  );
}
