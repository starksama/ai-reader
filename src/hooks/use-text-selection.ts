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

  const handleSelectionChange = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      setSelection({ text: '', paragraphIndex: null, range: null });
      return;
    }

    const text = sel.toString().trim();
    if (text.length < 3) {
      setSelection({ text: '', paragraphIndex: null, range: null });
      return;
    }

    // Find which paragraph the selection is in
    const range = sel.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const paragraphEl = container.nodeType === Node.TEXT_NODE
      ? container.parentElement?.closest('[data-paragraph-index]')
      : (container as Element).closest('[data-paragraph-index]');

    const paragraphIndex = paragraphEl
      ? parseInt(paragraphEl.getAttribute('data-paragraph-index') || '-1', 10)
      : null;

    setSelection({
      text,
      paragraphIndex: paragraphIndex !== -1 ? paragraphIndex : null,
      range: range.cloneRange(),
    });
  }, []);

  const clearSelection = useCallback(() => {
    window.getSelection()?.removeAllRanges();
    setSelection({ text: '', paragraphIndex: null, range: null });
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [handleSelectionChange]);

  return {
    selection,
    hasSelection: selection.text.length > 0,
    clearSelection,
  };
}
