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
  
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isTouchRef = useRef(false);

  const processSelection = useCallback(() => {
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
      
      // Get start and end containers
      const startContainer = range.startContainer;
      const endContainer = range.endContainer;
      
      // Find paragraph for start
      let startElement: Element | null = null;
      if (startContainer.nodeType === Node.TEXT_NODE) {
        startElement = startContainer.parentElement;
      } else {
        startElement = startContainer as Element;
      }
      const startParagraph = startElement?.closest?.('[data-paragraph-index]');
      
      // Find paragraph for end
      let endElement: Element | null = null;
      if (endContainer.nodeType === Node.TEXT_NODE) {
        endElement = endContainer.parentElement;
      } else {
        endElement = endContainer as Element;
      }
      const endParagraph = endElement?.closest?.('[data-paragraph-index]');
      
      // Only accept if selection is within a single paragraph
      if (!startParagraph || !endParagraph || startParagraph !== endParagraph) {
        return;
      }

      const paragraphIndex = parseInt(
        startParagraph.getAttribute('data-paragraph-index') || '-1',
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
    // Detect if device supports touch
    const handleTouchStart = () => {
      isTouchRef.current = true;
    };

    // Main selection handler using selectionchange event
    // This is the most reliable cross-browser/device approach
    const handleSelectionChange = () => {
      // Clear any pending debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      const sel = window.getSelection();
      
      // If selection is cleared
      if (!sel || sel.isCollapsed) {
        // Small delay before clearing to avoid flicker
        debounceRef.current = setTimeout(() => {
          const currentSel = window.getSelection();
          if (!currentSel || currentSel.isCollapsed) {
            setSelection({ text: '', paragraphIndex: null, range: null });
          }
        }, 100);
        return;
      }

      // For touch devices, use a longer delay to let native menu appear/dismiss
      // For mouse, process quickly
      const delay = isTouchRef.current ? 600 : 50;
      
      debounceRef.current = setTimeout(() => {
        processSelection();
      }, delay);
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('selectionchange', handleSelectionChange);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('selectionchange', handleSelectionChange);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [processSelection]);

  return {
    selection,
    hasSelection: selection.text.length > 0,
    clearSelection,
  };
}
