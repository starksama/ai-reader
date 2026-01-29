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
  
  const mouseDownPosRef = useRef<{ x: number; y: number } | null>(null);

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
    const handleMouseDown = (e: MouseEvent) => {
      mouseDownPosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = (e: MouseEvent) => {
      const startPos = mouseDownPosRef.current;
      if (!startPos) return;
      
      // Only process as selection if mouse moved significantly (not a click)
      const dx = Math.abs(e.clientX - startPos.x);
      const dy = Math.abs(e.clientY - startPos.y);
      
      if (dx > 5 || dy > 5) {
        // Delay to let selection finalize
        setTimeout(updateSelection, 10);
      }
      
      mouseDownPosRef.current = null;
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
