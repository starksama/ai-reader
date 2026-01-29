'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { getMockArticle, type MockArticle } from '@/data/mock-articles';
import { useLayerStore } from '@/stores/layer-store';
import { ArticleView } from '@/components/reader/article-view';
import { DetailLayer } from '@/components/layers/detail-layer';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

export default function DemoArticlePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [article, setArticle] = useState<MockArticle | null>(null);
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

  // Load mock article
  useEffect(() => {
    const mockArticle = getMockArticle(id);
    if (mockArticle) {
      setArticle(mockArticle);
      reset();
    }
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center">
          <p className="animate-pulse" style={{ color: 'var(--text-secondary)' }}>Loading...</p>
        </div>
      </div>
    );
  }

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
            {/* Simple top bar */}
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
                  <span>Back to demos</span>
                </button>
                
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
