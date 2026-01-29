'use client';

import { useEffect, useState } from 'react';
import { useTextSelection } from '@/hooks/use-text-selection';
import { SelectionTooltip } from './selection-tooltip';

interface Paragraph {
  id: string;
  index: number;
  text: string;
  html: string;
}

interface Article {
  title: string;
  byline?: string;
  siteName?: string;
  excerpt?: string;
  paragraphs: Paragraph[];
  url: string;
  wordCount?: number;
}

interface ArticleViewProps {
  article: Article;
  selectedParagraph: number | null;
  onParagraphClick: (index: number) => void;
  onSelectionAsk?: (text: string, paragraphIndex: number) => void;
}

export function ArticleView({ 
  article, 
  selectedParagraph, 
  onParagraphClick,
  onSelectionAsk,
}: ArticleViewProps) {
  const [readProgress, setReadProgress] = useState(0);
  const [highlightedCount, setHighlightedCount] = useState(0);
  const { selection, hasSelection, clearSelection } = useTextSelection();

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(100, Math.round((scrollTop / docHeight) * 100)) : 0;
      setReadProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Count highlighted paragraphs
  useEffect(() => {
    if (selectedParagraph !== null) {
      setHighlightedCount(prev => prev + 1);
    }
  }, [selectedParagraph]);

  const handleAskAbout = (text: string, paragraphIndex: number) => {
    if (onSelectionAsk) {
      onSelectionAsk(text, paragraphIndex);
    } else {
      // Default: open the paragraph detail view
      onParagraphClick(paragraphIndex);
    }
  };

  return (
    <article className="pb-20">
      {/* Progress Bar */}
      <div 
        className="fixed top-0 left-0 right-0 h-1 z-30"
        style={{ backgroundColor: 'var(--border)' }}
      >
        <div 
          className="h-full transition-all duration-150"
          style={{ 
            width: `${readProgress}%`,
            backgroundColor: 'var(--accent)',
          }}
        />
      </div>

      {/* Selection Tooltip */}
      <SelectionTooltip
        selection={selection}
        onAskAbout={handleAskAbout}
        onClear={clearSelection}
      />

      {/* Header */}
      <header className="reader-container pt-6">
        <h1 
          className="text-2xl md:text-3xl font-bold mb-3 leading-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          {article.title}
        </h1>
        
        <div className="flex flex-wrap gap-2 text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          {article.byline && <span>{article.byline}</span>}
          {article.byline && article.siteName && <span>·</span>}
          {article.siteName && <span>{article.siteName}</span>}
        </div>

        {/* Stats */}
        <div 
          className="flex flex-wrap items-center gap-3 md:gap-4 text-sm py-3 px-4 rounded-lg mb-6"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <span style={{ color: 'var(--text-secondary)' }}>
            {readProgress}% read
          </span>
          <span className="hidden md:inline" style={{ color: 'var(--border)' }}>|</span>
          {article.wordCount && (
            <span style={{ color: 'var(--text-secondary)' }}>
              ~{Math.ceil(article.wordCount / 200)} min read
            </span>
          )}
          <span className="hidden md:inline" style={{ color: 'var(--border)' }}>|</span>
          <span style={{ color: 'var(--text-secondary)' }}>
            {article.paragraphs.length} paragraphs
          </span>
          {highlightedCount > 0 && (
            <>
              <span className="hidden md:inline" style={{ color: 'var(--border)' }}>|</span>
              <span style={{ color: 'var(--accent)' }}>
                {highlightedCount} explored
              </span>
            </>
          )}
        </div>

        {/* Hint */}
        <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
          💡 Tap any paragraph or select text to explore deeper
        </p>
      </header>

      {/* Paragraphs */}
      <div className="reader-container reader-text">
        {article.paragraphs.map((paragraph) => (
          <div
            key={paragraph.id}
            data-paragraph-index={paragraph.index}
            onClick={(e) => {
              // Don't trigger click if user is selecting text
              if (window.getSelection()?.toString().trim()) return;
              onParagraphClick(paragraph.index);
            }}
            className={`paragraph ${
              selectedParagraph === paragraph.index ? 'selected' : ''
            }`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onParagraphClick(paragraph.index)}
          >
            {paragraph.text}
          </div>
        ))}
      </div>

      {/* End marker */}
      <div className="reader-container text-center py-12">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          — End of article —
        </p>
      </div>
    </article>
  );
}
