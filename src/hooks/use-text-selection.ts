'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface TextSelection {
  text: string;
  paragraphIndex: number | null;
  range: Range | null;
}

export function useTextSelection() {
  const [selection, setSelection] = useState<TextSelection>({
    text: '',
    paragraphIndex: null,
    range: null,
  });
  
  const isSelectingRef = useRef(false);

  const updateSelection = useCallback(() => {
    const sel = window.getSelection();
    
    // No selection or collapsed (just a cursor)
    if (!sel || sel.isCollapsed) {
      return;
    }

    const text = sel.toString().trim();
    
    // Require minimum length
    if (text.length < 5) {
      return;
    }

    // Find which paragraph the selection is in
    try {
      const range = sel.getRangeAt(0);
      const container = range.commonAncestorContainer;
      
      // Find the paragraph element
      let element: Element | null = null;
      if (container.nodeType === Node.TEXT_NODE) {
        element = container.parentElement;
      } else {
        element = container as Element;
      }
      
      const paragraphEl = element?.closest?.('[data-paragraph-index]');
      
      if (!paragraphEl) {
        return;
      }

      const paragraphIndex = parseInt(
        paragraphEl.getAttribute('data-paragraph-index') || '-1',
        10
      );

      if (paragraphIndex === -1) {
        return;
      }

      setSelection({
        text,
        paragraphIndex,
        range: range.cloneRange(),
      });
    } catch (e) {
      // Selection API can throw in edge cases
      console.warn('Selection error:', e);
    }
  }, []);

  const clearSelection = useCallback(() => {
    window.getSelection()?.removeAllRanges();
    setSelection({ text: '', paragraphIndex: null, range: null });
  }, []);

  useEffect(() => {
    const handleMouseDown = () => {
      isSelectingRef.current = true;
    };

    const handleMouseUp = () => {
      // Delay to let selection finalize
      setTimeout(() => {
        if (isSelectingRef.current) {
          updateSelection();
          isSelectingRef.current = false;
        }
      }, 10);
    };

    const handleSelectionChange = () => {
      // If selection is cleared, update state
      const sel = window.getSelection();
      if (sel && sel.isCollapsed && selection.text) {
        // Give a small delay before clearing
        setTimeout(() => {
          const currentSel = window.getSelection();
          if (currentSel && currentSel.isCollapsed) {
            setSelection({ text: '', paragraphIndex: null, range: null });
          }
        }, 100);
      }
    };

    // Touch events for mobile
    const handleTouchEnd = () => {
      setTimeout(updateSelection, 200);
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('selectionchange', handleSelectionChange);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [updateSelection, selection.text]);

  return {
    selection,
    hasSelection: selection.text.length > 0,
    clearSelection,
  };
}
