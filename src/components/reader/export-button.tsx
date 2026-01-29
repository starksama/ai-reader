'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotesStore } from '@/stores/notes-store';

interface ExportButtonProps {
  url: string;
}

export function ExportButton({ url }: ExportButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [exported, setExported] = useState(false);
  const { getArticleNotes, exportNotes } = useNotesStore();
  const articleNotes = getArticleNotes(url);
  const noteCount = articleNotes?.notes.length || 0;

  const handleExport = () => {
    const markdown = exportNotes(url);
    if (!markdown) {
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
    
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  if (noteCount === 0) return null;

  return (
    <div className="relative">
      <motion.button
        onClick={handleExport}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
        style={{
          backgroundColor: exported ? 'var(--accent)' : 'var(--bg-secondary)',
          color: exported ? '#fff' : 'var(--text-secondary)',
        }}
      >
        <span>{exported ? '✓' : '📝'}</span>
        <span>{exported ? 'Exported!' : `${noteCount} notes`}</span>
      </motion.button>

      <AnimatePresence>
        {showTooltip && !exported && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute top-full right-0 mt-2 px-3 py-2 rounded-lg text-xs whitespace-nowrap"
            style={{
              backgroundColor: 'var(--text-primary)',
              color: 'var(--bg-primary)',
            }}
          >
            Export as markdown
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
