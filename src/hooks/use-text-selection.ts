'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface TextSelection {
  text: string;
  paragraphIndex: number | null;
}

/**
 * Hook to track text selection within paragraph elements.
 * 
 * Design decisions:
 * - Only tracks selections within single paragraphs (multi-paragraph selections are ignored)
 * - Minimum 5 characters required to trigger selection
 * - Uses selectionchange event for cross-browser/device compatibility
 * - Debounces selection processing (longer delay on touch devices)
 * - Does NOT store Range objects (they can become stale/corrupted)
 * 
 * Position calculation is done separately when needed via getSelectionRect()
 */
export function useTextSelection() {
  const [selection, setSelection] = useState<TextSelection>({
    text: '',
    paragraphIndex: null,
  });
  
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isTouchRef = useRef(false);

  /**
   * Get the current selection's bounding rect.
   * Called on-demand rather than storing stale range objects.
   */
  const getSelectionRect = useCallback((): DOMRect | null => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      return null;
    }
    
    try {
      const range = sel.getRangeAt(0);
      return range.getBoundingClientRect();
    } catch {
      return null;
    }
  }, []);

  const processSelection = useCallback(() => {
    const sel = window.getSelection();
    
    // No selection or collapsed (just a cursor)
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
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
      });
    } catch (e) {
      // Selection API can throw in edge cases
      console.warn('Selection error:', e);
    }
  }, []);

  const clearSelection = useCallback(() => {
    window.getSelection()?.removeAllRanges();
    setSelection({ text: '', paragraphIndex: null });
  }, []);

  useEffect(() => {
    // Detect if device supports touch
    const handleTouchStart = () => {
      isTouchRef.current = true;
    };

    // Listen for mouse up to process selection (more reliable than selectionchange for drag-select)
    const handleMouseUp = () => {
      // Clear any pending debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      
      // Small delay to let selection finalize
      debounceRef.current = setTimeout(() => {
        processSelection();
      }, 50);
    };

    // Handle selection change for clearing and touch devices
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      
      // If selection is cleared, update state
      if (!sel || sel.isCollapsed) {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
          const currentSel = window.getSelection();
          if (!currentSel || currentSel.isCollapsed) {
            setSelection({ text: '', paragraphIndex: null });
          }
        }, 100);
        return;
      }

      // For touch devices, also process on selectionchange (after delay)
      if (isTouchRef.current) {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
          processSelection();
        }, 600);
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('selectionchange', handleSelectionChange);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('mouseup', handleMouseUp);
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
    getSelectionRect,
  };
}
