'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X, Download, Share2 } from 'lucide-react';
import { useNotesStore } from '@/stores/notes-store';
import { useHighlightStore } from '@/stores/highlight-store';
import { ChatBubble } from '@/components/chat/chat-bubble';

interface FinishButtonProps {
  articleUrl: string;
  articleTitle: string;
}

export function FinishButton({ articleUrl, articleTitle }: FinishButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  
  const { getArticleNotes, exportNotes } = useNotesStore();
  const { getHighlights } = useHighlightStore();
  
  const article = getArticleNotes(articleUrl);
  const highlights = getHighlights(articleUrl);
  
  // Count threads with messages (questions explored)
  const articleThreads = article?.threads;
  const threads = useMemo(() => {
    if (!articleThreads) return [];
    return Object.values(articleThreads).filter(t => t.messages.length > 0);
  }, [articleThreads]);
  
  const questionCount = threads.length;
  const highlightCount = highlights.length;
  const totalCount = questionCount + highlightCount;

  if (totalCount === 0) return null;

  const handleFinish = async () => {
    setIsOpen(true);
    setIsSummarizing(true);
    
    // Mock summary generation
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate summary based on threads and highlights
    let summaryText = `## Session Summary: ${articleTitle}\n\n`;
    
    if (highlightCount > 0) {
      summaryText += `**${highlightCount} key passages highlighted:**\n`;
      highlights.slice(0, 3).forEach((h, i) => {
        summaryText += `${i + 1}. "${h.text.slice(0, 100)}${h.text.length > 100 ? '...' : ''}"\n`;
      });
      summaryText += '\n';
    }
    
    if (questionCount > 0) {
      summaryText += `**${questionCount} sections explored:**\n`;
      threads.slice(0, 3).forEach((thread, i) => {
        const firstQuestion = thread.messages.find(m => m.role === 'user');
        if (firstQuestion) {
          summaryText += `${i + 1}. ${firstQuestion.content}\n`;
        }
      });
      summaryText += '\n';
    }
    
    summaryText += '**Key takeaway:** You engaged deeply with this content, exploring multiple concepts and saving important passages for later reference.';
    
    setSummary(summaryText);
    setIsSummarizing(false);
  };

  const handleExport = () => {
    let markdown = exportNotes(articleUrl);
    
    if (highlights.length > 0) {
      markdown += '\n\n## Highlights\n\n';
      highlights.forEach((h, i) => {
        markdown += `${i + 1}. "${h.text}"\n\n`;
      });
    }
    
    if (summary) {
      markdown += '\n\n---\n\n' + summary;
    }

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${articleTitle.slice(0, 30)}-notes.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  };

  return (
    <>
      {/* Floating Finish Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={handleFinish}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 rounded-full shadow-lg transition-transform hover:scale-105"
        style={{
          backgroundColor: 'var(--accent)',
          color: '#fff',
        }}
      >
        <CheckCircle size={18} />
        <span className="font-medium">Finish</span>
        <span 
          className="ml-1 px-2 py-0.5 text-xs rounded-full"
          style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
        >
          {totalCount}
        </span>
      </motion.button>

      {/* Summary Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed z-50 inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[500px] md:max-h-[80vh] overflow-auto rounded-xl shadow-2xl"
              style={{ backgroundColor: 'var(--bg-primary)' }}
            >
              {/* Header */}
              <div 
                className="sticky top-0 p-4 flex items-center justify-between border-b"
                style={{ 
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border)',
                }}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle size={20} style={{ color: 'var(--accent)' }} />
                  <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Session Complete
                  </h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-md transition-colors hover:bg-[var(--bg-secondary)]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Stats */}
                <div 
                  className="flex justify-around p-4 rounded-lg mb-4"
                  style={{ backgroundColor: 'var(--bg-secondary)' }}
                >
                  <div className="text-center">
                    <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
                      {highlightCount}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      Highlights
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
                      {questionCount}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      Explored
                    </p>
                  </div>
                </div>

                {/* Summary */}
                <div className="mb-4">
                  <ChatBubble 
                    role="assistant" 
                    content={summary || ''} 
                    isLoading={isSummarizing}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={handleExport}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors"
                    style={{
                      backgroundColor: 'var(--accent)',
                      color: '#fff',
                    }}
                  >
                    <Download size={16} />
                    Export Notes
                  </button>
                  <button
                    onClick={() => {
                      navigator.share?.({
                        title: articleTitle,
                        text: summary || 'Check out this article',
                        url: window.location.href,
                      });
                    }}
                    className="px-4 py-3 rounded-lg transition-colors"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
