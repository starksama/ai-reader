'use client';

import { useState } from 'react';
import { Download, Check } from 'lucide-react';
import { useNotesStore } from '@/stores/notes-store';
import { useHighlightStore } from '@/stores/highlight-store';

interface ExportButtonProps {
  url: string;
}

export function ExportButton({ url }: ExportButtonProps) {
  const [exported, setExported] = useState(false);
  const { getArticleNotes, exportNotes } = useNotesStore();
  const { getHighlights } = useHighlightStore();
  
  const articleNotes = getArticleNotes(url);
  const highlights = getHighlights(url);
  const noteCount = articleNotes?.notes.length || 0;
  const highlightCount = highlights.length;
  const totalCount = noteCount + highlightCount;

  const handleExport = () => {
    let markdown = exportNotes(url);
    
    // Add highlights to export
    if (highlights.length > 0) {
      markdown += '\n\n## Highlights\n\n';
      highlights.forEach((h, i) => {
        markdown += `${i + 1}. "${h.text}"\n\n`;
      });
    }
    
    if (!markdown.trim()) {
      return;
    }

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `notes-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
    
    setExported(true);
    setTimeout(() => setExported(false), 1500);
  };

  if (totalCount === 0) return null;

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-2 py-1 text-xs transition-colors hover:opacity-70"
      style={{ color: exported ? 'var(--accent)' : 'var(--text-secondary)' }}
    >
      {exported ? <Check size={12} /> : <Download size={12} />}
      <span>{exported ? 'Exported' : `${totalCount}`}</span>
    </button>
  );
}
