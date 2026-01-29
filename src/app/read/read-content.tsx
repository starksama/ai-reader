'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLayerStore } from '@/stores/layer-store';
import { Breadcrumb } from '@/components/reader/breadcrumb';
import { ArticleView } from '@/components/reader/article-view';
import { DetailLayer } from '@/components/layers/detail-layer';

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
  
  const { layers, currentIndex, push, pop } = useLayerStore();
  const currentLayer = layers[currentIndex];

  useEffect(() => {
    if (!url) {
      setError('No URL provided');
      setIsLoading(false);
      return;
    }

    async function fetchArticle() {
      try {
        setIsLoading(true);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-2xl mb-2">📖</div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading article...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">😕</div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Couldn&apos;t load article
          </h2>
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>{error}</p>
          <a
            href="/"
            className="inline-block px-4 py-2 rounded-lg text-white"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Try another URL
          </a>
        </div>
      </div>
    );
  }

  if (!article) return null;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Breadcrumb */}
      <div className="sticky top-0 z-10 px-4 py-2" style={{ backgroundColor: 'var(--bg-primary)' }}>
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
      </div>

      {/* Layer Stack */}
      <div className="relative">
        {/* Main Article Layer */}
        <div
          className={`transition-transform duration-300 ease-out ${
            currentIndex > 0 ? '-translate-x-full' : 'translate-x-0'
          }`}
        >
          <ArticleView
            article={article}
            selectedParagraph={selectedParagraph}
            onParagraphClick={handleParagraphClick}
          />
        </div>

        {/* Detail Layer */}
        {currentIndex > 0 && currentLayer.type === 'paragraph' && (
          <div
            className="absolute inset-0 transition-transform duration-300 ease-out"
            style={{ backgroundColor: 'var(--bg-primary)' }}
          >
            <DetailLayer
              paragraph={article.paragraphs[currentLayer.paragraphIndex!]}
              onBack={handleBack}
            />
          </div>
        )}
      </div>
    </div>
  );
}
