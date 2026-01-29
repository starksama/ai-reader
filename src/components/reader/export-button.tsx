'use client';

import { useNotesStore } from '@/stores/notes-store';

interface ExportButtonProps {
  url: string;
}

export function ExportButton({ url }: ExportButtonProps) {
  const { getArticleNotes, exportNotes } = useNotesStore();
  const articleNotes = getArticleNotes(url);
  const noteCount = articleNotes?.notes.length || 0;

  const handleExport = () => {
    const markdown = exportNotes(url);
    if (!markdown) {
      alert('No notes to export yet. Ask questions about paragraphs to create notes!');
      return;
    }

    // Create and download file
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `ai-reader-notes-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  };

  if (noteCount === 0) return null;

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-secondary)',
      }}
    >
      <span>📝</span>
      <span>Export {noteCount} note{noteCount !== 1 ? 's' : ''}</span>
    </button>
  );
}
