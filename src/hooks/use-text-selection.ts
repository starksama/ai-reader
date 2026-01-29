'use client';

import { useState, useEffect, useCallback } from 'react';

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

  const updateSelection = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      // Don't clear immediately on mobile to allow for menu interaction
      return;
    }

    const text = sel.toString().trim();
    if (text.length < 3) {
      return;
    }

    // Find which paragraph the selection is in
    const range = sel.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const paragraphEl = container.nodeType === Node.TEXT_NODE
      ? container.parentElement?.closest('[data-paragraph-index]')
      : (container as Element).closest?.('[data-paragraph-index]');

    const paragraphIndex = paragraphEl
      ? parseInt(paragraphEl.getAttribute('data-paragraph-index') || '-1', 10)
      : null;

    if (paragraphIndex === -1) {
      return;
    }

    setSelection({
      text,
      paragraphIndex,
      range: range.cloneRange(),
    });
  }, []);

  const clearSelection = useCallback(() => {
    window.getSelection()?.removeAllRanges();
    setSelection({ text: '', paragraphIndex: null, range: null });
  }, []);

  useEffect(() => {
    // Handle mouse selection
    const handleMouseUp = () => {
      // Small delay to allow selection to finalize
      setTimeout(updateSelection, 10);
    };

    // Handle touch selection (for mobile)
    const handleTouchEnd = () => {
      // Longer delay for touch to allow selection handles to appear
      setTimeout(updateSelection, 100);
    };

    // Handle selection change (works for both mouse and touch)
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (sel && sel.isCollapsed && selection.text) {
        // Selection was cleared by user
        setTimeout(() => {
          const currentSel = window.getSelection();
          if (currentSel && currentSel.isCollapsed) {
            setSelection({ text: '', paragraphIndex: null, range: null });
          }
        }, 200);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('selectionchange', handleSelectionChange);

    return () => {
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
