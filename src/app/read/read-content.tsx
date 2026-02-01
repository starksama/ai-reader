'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, FileText } from 'lucide-react';
import { useLayerStore } from '@/stores/layer-store';
import { useThemeStore } from '@/stores/theme-store';
import { useReaderStore } from '@/stores/reader-store';
import { ArticleView } from '@/components/reader/article-view';
import { DetailLayer } from '@/components/layers/detail-layer';
import { ExportButton } from '@/components/reader/export-button';
import { LoadingSkeleton } from '@/components/reader/loading-skeleton';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { SettingsPanel } from '@/components/reader/settings-panel';
import { KeyboardHints } from '@/components/reader/keyboard-hints';
import { FinishButton } from '@/components/reader/finish-button';
import type { ParsedArticle } from '@/utils/parse-content';

export function ReadContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const url = searchParams.get('url');
  const source = searchParams.get('source');
  
  const [article, setArticle] = useState<ParsedArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedParagraph, setSelectedParagraph] = useState<number | null>(null);
  const [exploredParagraphs, setExploredParagraphs] = useState<Set<number>>(new Set());
  
  const { layers, currentIndex, push, pop, reset } = useLayerStore();
  const { fontSize } = useThemeStore();
  const { loadArticle } = useReaderStore();
  const isDetailView = currentIndex > 0;

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onEscape: () => {
      if (currentIndex > 0) {
        pop();
        setSelectedParagraph(null);
      }
    },
    onBack: () => {
      if (currentIndex > 0) {
        pop();
        setSelectedParagraph(null);
      }
    },
  });

  // Reset layers when URL changes
  useEffect(() => {
    reset();
  }, [url, source, reset]);

  // Load article from URL or pasted content
  useEffect(() => {
    // If source is paste/pdf/file, use article from store/sessionStorage
    const isLocalSource = source === 'paste' || source === 'pdf' || source === 'file';
    
    if (isLocalSource) {
      const storedArticle = loadArticle();
      if (storedArticle) {
        setArticle(storedArticle);
        setIsLoading(false);
        setError(null);
      } else {
        setError('No content found. Please go back and try again.');
        setIsLoading(false);
      }
      return;
    }

    // Otherwise fetch from URL
    if (!url) {
      setError('No URL provided');
      setIsLoading(false);
      return;
    }

    async function fetchArticle() {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });

        // Check if response has content
        const text = await response.text();
        if (!text) {
          throw new Error('Server returned empty response. Try pasting the content instead.');
        }

        // Parse JSON
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          console.error('Failed to parse response:', text.substring(0, 200));
          throw new Error('Could not fetch article. Try pasting the content instead.');
        }

        if (!response.ok) {
          throw new Error(data.error || 'Failed to parse article');
        }

        setArticle(data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load article');
      } finally {
        setIsLoading(false);
      }
    }

    fetchArticle();
  }, [url, source, loadArticle]);

  // Article cleanup is handled by setArticle overwriting the old one
  // Don't cleanup on unmount - it causes race conditions with strict mode

  const handleParagraphClick = (index: number, selectedText?: string) => {
    setSelectedParagraph(index);
    setExploredParagraphs(prev => new Set([...prev, index]));
    push({
      type: 'paragraph',
      paragraphIndex: index,
      selectedText,
      content: article?.paragraphs[index]?.text,
    });
  };

  const handleBack = () => {
    pop();
    if (currentIndex <= 1) {
      setSelectedParagraph(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div 
          className="sticky top-0 z-40 border-b backdrop-blur-sm"
          style={{ 
            backgroundColor: 'rgba(var(--bg-primary-rgb), 0.9)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="reader-container py-3">
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span className="animate-pulse">Loading...</span>
            </div>
          </div>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Couldn&apos;t load article
          </h2>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>{error}</p>
          
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <FileText size={14} />
              <span>Paste content instead</span>
            </Link>
            
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-opacity hover:opacity-70 text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              <ArrowLeft size={14} />
              <span>Try another URL</span>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!article) return null;

  const currentLayer = layers[currentIndex];
  const isLocalSource = source === 'paste' || source === 'pdf' || source === 'file';
  const articleUrl = isLocalSource ? (article?.url || 'local-content') : (url || '');

  return (
    <div className={`min-h-screen font-${fontSize}`} style={{ backgroundColor: 'var(--bg-primary)' }}>
      <AnimatePresence mode="wait">
        {!isDetailView ? (
          <motion.div
            key="article"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Top bar */}
            <div 
              className="sticky top-0 z-40 border-b backdrop-blur-sm"
              style={{ 
                backgroundColor: 'rgba(var(--bg-primary-rgb), 0.9)',
                borderColor: 'var(--border)',
              }}
            >
              <div className="reader-container py-3 flex items-center justify-between">
                <button
                  onClick={() => router.push('/')}
                  className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70 -ml-1"
                  style={{ color: 'var(--accent)' }}
                >
                  <ArrowLeft size={14} />
                  <span>Back</span>
                </button>
                
                <div className="flex items-center gap-2">
                  {(source === 'paste' || source === 'pdf' || source === 'file') && (
                    <div 
                      className="text-xs px-2 py-1 rounded-md flex items-center gap-1"
                      style={{ 
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <FileText size={10} />
                      <span>{source === 'pdf' ? 'PDF' : source === 'file' ? 'File' : 'Pasted'}</span>
                    </div>
                  )}
                  {exploredParagraphs.size > 0 && (
                    <div 
                      className="text-xs px-2 py-1 rounded-md"
                      style={{ 
                        backgroundColor: 'var(--accent)',
                        color: '#fff',
                      }}
                    >
                      {exploredParagraphs.size} explored
                    </div>
                  )}
                  {articleUrl && <ExportButton url={articleUrl} />}
                  <KeyboardHints />
                  <SettingsPanel />
                </div>
              </div>
            </div>

            <ArticleView
              article={article}
              selectedParagraph={selectedParagraph}
              exploredParagraphs={exploredParagraphs}
              onParagraphClick={handleParagraphClick}
              onSelectionAsk={(text, index) => handleParagraphClick(index, text)}
            />
            
            {articleUrl && (
              <FinishButton 
                articleUrl={articleUrl} 
                articleTitle={article.title} 
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            {currentLayer?.type === 'paragraph' && article.paragraphs[currentLayer.paragraphIndex!] && (
              <DetailLayer
                paragraph={article.paragraphs[currentLayer.paragraphIndex!]}
                articleUrl={articleUrl}
                articleTitle={article.title}
                selectedText={currentLayer.selectedText}
                exploredParagraphs={Array.from(exploredParagraphs)}
                allParagraphs={article.paragraphs}
                onBack={handleBack}
                onNavigate={(index) => {
                  if (index >= 0 && index < article.paragraphs.length) {
                    handleParagraphClick(index);
                  }
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
