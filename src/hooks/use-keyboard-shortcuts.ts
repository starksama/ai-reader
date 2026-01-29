'use client';

import { useEffect } from 'react';

interface KeyboardShortcutsOptions {
  onEscape?: () => void;
  onBack?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export function useKeyboardShortcuts({ 
  onEscape, 
  onBack,
  onPrev,
  onNext,
}: KeyboardShortcutsOptions) {
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
        case 'ArrowUp':
        case 'k': // vim-style
          if (onPrev) {
            onPrev();
            e.preventDefault();
          }
          break;
        case 'ArrowDown':
        case 'j': // vim-style
          if (onNext) {
            onNext();
            e.preventDefault();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onEscape, onBack, onPrev, onNext]);
}
