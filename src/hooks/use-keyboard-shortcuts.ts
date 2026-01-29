'use client';

import { useEffect } from 'react';

interface KeyboardShortcutsOptions {
  onEscape?: () => void;
  onBack?: () => void;
}

export function useKeyboardShortcuts({ onEscape, onBack }: KeyboardShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        // Allow Escape even in inputs
        if (e.key === 'Escape' && onEscape) {
          onEscape();
          e.preventDefault();
        }
        return;
      }

      switch (e.key) {
        case 'Escape':
          onEscape?.();
          break;
        case 'Backspace':
        case 'ArrowLeft':
          if (e.altKey || e.metaKey) {
            onBack?.();
            e.preventDefault();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onEscape, onBack]);
}
