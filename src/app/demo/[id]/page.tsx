'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getMockArticle, type MockArticle } from '@/data/mock-articles';
import { useLayerStore } from '@/stores/layer-store';
import { Breadcrumb } from '@/components/reader/breadcrumb';
import { ArticleView } from '@/components/reader/article-view';
import { DetailLayer } from '@/components/layers/detail-layer';
import { LayerStack } from '@/components/layers/layer-stack';
import { ExportButton } from '@/components/reader/export-button';
import { ReaderHeader } from '@/components/reader/reader-header';
import { ShortcutsHint } from '@/components/reader/shortcuts-hint';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

export default function DemoArticlePage() {
  const params = useParams();
  const id = params.id as string;
  
  const [article, setArticle] = useState<MockArticle | null>(null);
  const [selectedParagraph, setSelectedParagraph] = useState<number | null>(null);
  const [exploredParagraphs, setExploredParagraphs] = useState<Set<number>>(new Set());
  const { layers, currentIndex, push, pop, reset } = useLayerStore();

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
      <>
        <ReaderHeader />
        <div className="min-h-screen flex items-center justify-center">
          <p style={{ color: 'var(--text-secondary)' }}>Article not found</p>
        </div>
      </>
    );
  }

  return (
    <>
      <ReaderHeader articleUrl={article.url} />
      <div className="min-h-screen">
        {/* Sticky Breadcrumb */}
        <div 
          className="sticky top-[57px] z-20 px-4 py-2 border-b"
          style={{ 
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <Breadcrumb
              layers={layers}
              currentIndex={currentIndex}
              onNavigate={(index) => {
                if (index === 0) {
                  setSelectedParagraph(null);
                }
                useLayerStore.getState().goTo(index);
              }}
            />
            <ExportButton url={article.url} />
          </div>
        </div>

        {/* Layer Stack with Swipe */}
        <LayerStack currentIndex={currentIndex} onSwipeBack={handleBack}>
          {/* Main Article Layer */}
          <ArticleView
            article={article}
            selectedParagraph={selectedParagraph}
            exploredParagraphs={exploredParagraphs}
            onParagraphClick={handleParagraphClick}
            onSelectionAsk={(text, index) => handleParagraphClick(index, text)}
          />

          {/* Detail Layers */}
          {layers.slice(1).map((layer) => (
            <div key={layer.id}>
              {layer.type === 'paragraph' && article.paragraphs[layer.paragraphIndex!] && (
                <DetailLayer
                  paragraph={article.paragraphs[layer.paragraphIndex!]}
                  articleUrl={article.url}
                  articleTitle={article.title}
                  selectedText={layer.selectedText}
                  totalParagraphs={article.paragraphs.length}
                  onBack={handleBack}
                  onNavigate={(index) => {
                    if (index >= 0 && index < article.paragraphs.length) {
                      handleParagraphClick(index);
                    }
                  }}
                />
              )}
            </div>
          ))}
        </LayerStack>
      </div>
      <ShortcutsHint />
    </>
  );
}
