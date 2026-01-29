'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLayerStore } from '@/stores/layer-store';
import { Breadcrumb } from '@/components/reader/breadcrumb';
import { ArticleView } from '@/components/reader/article-view';
import { DetailLayer } from '@/components/layers/detail-layer';
import { LayerStack } from '@/components/layers/layer-stack';
import { ExportButton } from '@/components/reader/export-button';
import { LoadingSkeleton } from '@/components/reader/loading-skeleton';
import { ReaderHeader } from '@/components/reader/reader-header';
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
}

export function ReadContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get('url');
  
  const [article, setArticle] = useState<ParsedArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedParagraph, setSelectedParagraph] = useState<number | null>(null);
  
  const { layers, currentIndex, push, pop, reset } = useLayerStore();
  const currentLayer = layers[currentIndex];

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

  const handleParagraphClick = (index: number) => {
    setSelectedParagraph(index);
    push({
      type: 'paragraph',
      paragraphIndex: index,
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
      <>
        <ReaderHeader articleUrl={url || undefined} />
        <div className="min-h-screen">
          <div 
            className="sticky top-[57px] z-20 px-4 py-2 border-b"
            style={{ 
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span className="animate-pulse">📖</span>
              <span>Loading article...</span>
            </div>
          </div>
          <LoadingSkeleton />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <ReaderHeader />
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="text-5xl mb-4">😕</div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Couldn&apos;t load article
            </h2>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>{error}</p>
            <a
              href="/"
              className="inline-block px-6 py-3 rounded-lg text-white font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              ← Try another URL
            </a>
          </div>
        </div>
      </>
    );
  }

  if (!article) return null;

  return (
    <>
      <ReaderHeader articleUrl={url || undefined} />
      <div className="min-h-screen">
        {/* Sticky Breadcrumb - below header */}
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
          {url && <ExportButton url={url} />}
        </div>
      </div>

      {/* Layer Stack with Swipe */}
      <LayerStack currentIndex={currentIndex} onSwipeBack={handleBack}>
        {/* Main Article Layer */}
        <ArticleView
          article={article}
          selectedParagraph={selectedParagraph}
          onParagraphClick={handleParagraphClick}
        />

        {/* Detail Layers */}
        {layers.slice(1).map((layer) => (
          <div key={layer.id}>
            {layer.type === 'paragraph' && article.paragraphs[layer.paragraphIndex!] && (
              <DetailLayer
                paragraph={article.paragraphs[layer.paragraphIndex!]}
                articleUrl={url || ''}
                articleTitle={article.title}
                onBack={handleBack}
              />
            )}
          </div>
        ))}
      </LayerStack>
      </div>
    </>
  );
}
