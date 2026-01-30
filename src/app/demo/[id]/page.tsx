'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { getMockArticle } from '@/data/mock-articles';
import { useLayerStore } from '@/stores/layer-store';
import { useThemeStore } from '@/stores/theme-store';
import { ArticleView } from '@/components/reader/article-view';
import { DetailLayer } from '@/components/layers/detail-layer';
import { LoadingSkeleton } from '@/components/reader/loading-skeleton';
import { SettingsPanel } from '@/components/reader/settings-panel';
import { KeyboardHints } from '@/components/reader/keyboard-hints';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

export default function DemoArticlePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const article = useMemo(() => getMockArticle(id), [id]);
  const [selectedParagraph, setSelectedParagraph] = useState<number | null>(null);
  const [exploredParagraphs, setExploredParagraphs] = useState<Set<number>>(new Set());
  const { layers, currentIndex, push, pop, reset } = useLayerStore();
  const { fontSize } = useThemeStore();

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

  // Reset layers when article changes
  useEffect(() => {
    reset();
  }, [id, reset]);

  const handleParagraphClick = (index: number, selectedText?: string) => {
    setSelectedParagraph(index);
    setExploredParagraphs(prev => new Set([...prev, index]));
    push({
      type: 'paragraph',
      paragraphIndex: index,
      selectedText,
    });
  };

  const handleBack = () => {
    pop();
    setSelectedParagraph(null);
  };

  if (!article) {
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

  const currentLayer = layers[currentIndex];

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
                  onClick={() => router.push('/demo')}
                  className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
                  style={{ color: 'var(--accent)' }}
                >
                  <ArrowLeft size={14} />
                  <span>Back</span>
                </button>
                
                <div className="flex items-center gap-2">
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
                articleUrl={article.url}
                articleTitle={article.title}
                selectedText={currentLayer.selectedText}
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
