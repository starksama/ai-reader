'use client';

import { useState } from 'react';
import { Keyboard } from 'lucide-react';
import { Popup } from '@/components/ui/popup';

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
        className="w-9 h-9 flex items-center justify-center rounded-lg transition-all"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border)',
        }}
        title="Keyboard shortcuts"
      >
        <Keyboard size={16} />
      </button>

      <Popup 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title="Keyboard Shortcuts"
        position="top-right"
      >
        <div className="space-y-3">
          {shortcuts.map((s) => (
            <div 
              key={s.key}
              className="flex items-center justify-between"
            >
              <kbd 
                className="px-2.5 py-1 text-xs rounded-md font-mono"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                }}
              >
                {s.key}
              </kbd>
              <span 
                className="text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                {s.action}
              </span>
            </div>
          ))}
        </div>

        <p 
          className="text-xs mt-4 pt-3 text-center"
          style={{ 
            color: 'var(--text-tertiary)',
            borderTop: '1px solid var(--border)',
          }}
        >
          Works in detail view
        </p>
      </Popup>
    </>
  );
}
