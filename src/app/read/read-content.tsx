'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useLayerStore } from '@/stores/layer-store';
import { ArticleView } from '@/components/reader/article-view';
import { DetailLayer } from '@/components/layers/detail-layer';
import { ExportButton } from '@/components/reader/export-button';
import { LoadingSkeleton } from '@/components/reader/loading-skeleton';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

interface ParsedArticle {
  title: string;
  byline?: string;
  siteName?: string;
  excerpt?: string;
  paragraphs: Array<{
    id: string;
    index: number;
    text: string;
    html: string;
  }>;
  url: string;
  wordCount?: number;
}

export function ReadContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const url = searchParams.get('url');
  
  const [article, setArticle] = useState<ParsedArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedParagraph, setSelectedParagraph] = useState<number | null>(null);
  const [exploredParagraphs, setExploredParagraphs] = useState<Set<number>>(new Set());
  
  const { layers, currentIndex, push, pop, reset } = useLayerStore();
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
  }, [url, reset]);

  useEffect(() => {
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

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to parse article');
        }

        setArticle(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load article');
      } finally {
        setIsLoading(false);
      }
    }

    fetchArticle();
  }, [url]);

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
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-sm text-white font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <ArrowLeft size={14} />
            <span>Try another URL</span>
          </a>
        </motion.div>
      </div>
    );
  }

  if (!article) return null;

  const currentLayer = layers[currentIndex];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
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
                  className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
                  style={{ color: 'var(--accent)' }}
                >
                  <ArrowLeft size={14} />
                  <span>Back</span>
                </button>
                
                <div className="flex items-center gap-3">
                  {exploredParagraphs.size > 0 && (
                    <div 
                      className="text-xs px-2 py-1 rounded-sm"
                      style={{ 
                        backgroundColor: 'var(--accent)',
                        color: '#fff',
                      }}
                    >
                      {exploredParagraphs.size} explored
                    </div>
                  )}
                  {url && <ExportButton url={url} />}
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
                articleUrl={url || ''}
                articleTitle={article.title}
                selectedText={currentLayer.selectedText}
                totalParagraphs={article.paragraphs.length}
                exploredParagraphs={Array.from(exploredParagraphs)}
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
