'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useTextSelection } from '@/hooks/use-text-selection';
import { SelectionMenu } from './selection-menu';
import { ParagraphMenu } from './paragraph-menu';

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
  exploredParagraphs?: Set<number>;
  onParagraphClick: (index: number, selectedText?: string) => void;
  onSelectionAsk?: (text: string, paragraphIndex: number) => void;
}

export function ArticleView({ 
  article, 
  selectedParagraph, 
  exploredParagraphs = new Set(),
  onParagraphClick,
  onSelectionAsk,
}: ArticleViewProps) {
  const [readProgress, setReadProgress] = useState(0);
  const { selection, clearSelection } = useTextSelection();
  
  // Paragraph menu state
  const [paragraphMenu, setParagraphMenu] = useState<{
    isOpen: boolean;
    index: number;
    text: string;
    position: { x: number; y: number };
  }>({
    isOpen: false,
    index: -1,
    text: '',
    position: { x: 0, y: 0 },
  });

  // Track mouse interaction for click vs select detection
  const mouseDownRef = useRef<{ x: number; y: number; time: number } | null>(null);

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

  // Close paragraph menu when selection appears
  useEffect(() => {
    if (selection.text) {
      setParagraphMenu(prev => ({ ...prev, isOpen: false }));
    }
  }, [selection.text]);

  const handleDiveDeeper = (text: string, paragraphIndex: number) => {
    if (onSelectionAsk) {
      onSelectionAsk(text, paragraphIndex);
    } else {
      onParagraphClick(paragraphIndex, text);
    }
  };

  const handleParagraphMouseDown = (e: React.MouseEvent) => {
    mouseDownRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    };
  };

  const handleParagraphMouseUp = (
    e: React.MouseEvent,
    paragraph: Paragraph
  ) => {
    const mouseDown = mouseDownRef.current;
    if (!mouseDown) return;

    // Calculate if this was a click (not a drag)
    const dx = Math.abs(e.clientX - mouseDown.x);
    const dy = Math.abs(e.clientY - mouseDown.y);
    const dt = Date.now() - mouseDown.time;

    // If moved too much or took too long, it's a drag/selection, not a click
    if (dx > 10 || dy > 10 || dt > 300) {
      mouseDownRef.current = null;
      return;
    }

    // Small delay to check if text was selected
    setTimeout(() => {
      const sel = window.getSelection();
      const hasSelection = sel && sel.toString().trim().length > 0;

      if (!hasSelection) {
        // It's a click - show paragraph menu
        setParagraphMenu({
          isOpen: true,
          index: paragraph.index,
          text: paragraph.text,
          position: { x: e.clientX, y: e.clientY + 10 },
        });
      }
      mouseDownRef.current = null;
    }, 50);
  };

  const closeParagraphMenu = useCallback(() => {
    setParagraphMenu(prev => ({ ...prev, isOpen: false }));
  }, []);

  const exploredCount = exploredParagraphs.size;

  return (
    <article className="pb-20">
      {/* Progress Bar */}
      <div 
        className="fixed top-0 left-0 right-0 h-0.5 z-50"
        style={{ backgroundColor: 'var(--border)' }}
      >
        <div 
          className="h-full transition-all duration-150 ease-out"
          style={{ 
            width: `${readProgress}%`,
            backgroundColor: 'var(--accent)',
          }}
        />
      </div>

      {/* Selection Menu (for text selection) */}
      <SelectionMenu
        selection={selection}
        onDiveDeeper={handleDiveDeeper}
        onCopy={() => {}}
        onClear={clearSelection}
      />

      {/* Paragraph Menu (for paragraph click) */}
      <ParagraphMenu
        isOpen={paragraphMenu.isOpen}
        paragraphIndex={paragraphMenu.index}
        paragraphText={paragraphMenu.text}
        position={paragraphMenu.position}
        onDiveDeeper={() => {
          onParagraphClick(paragraphMenu.index);
          closeParagraphMenu();
        }}
        onCopy={() => {}}
        onClose={closeParagraphMenu}
      />

      {/* Header */}
      <header className="reader-container pt-8 pb-6">
        <h1 
          className="text-2xl md:text-4xl font-bold mb-4 leading-tight tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          {article.title}
        </h1>
        
        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {article.byline && (
            <span className="font-medium">{article.byline}</span>
          )}
          {article.siteName && (
            <>
              <span className="opacity-40">·</span>
              <span>{article.siteName}</span>
            </>
          )}
          {article.wordCount && (
            <>
              <span className="opacity-40">·</span>
              <span>{Math.ceil(article.wordCount / 200)} min read</span>
            </>
          )}
        </div>

        {/* Progress stats */}
        <div className="flex items-center gap-4 mt-6 text-xs font-medium">
          <div 
            className="px-3 py-1.5 rounded-full"
            style={{ 
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
            }}
          >
            {readProgress}% read
          </div>
          {exploredCount > 0 && (
            <div 
              className="px-3 py-1.5 rounded-full"
              style={{ 
                backgroundColor: 'var(--accent)',
                color: '#fff',
              }}
            >
              {exploredCount} explored
            </div>
          )}
        </div>

        {/* Hint */}
        <p 
          className="mt-6 text-sm flex items-center gap-2"
          style={{ color: 'var(--text-secondary)' }}
        >
          <span>💡</span>
          <span>Click a paragraph or select text to dive deeper</span>
        </p>
      </header>

      {/* Paragraphs */}
      <div className="reader-container reader-text">
        {article.paragraphs.map((paragraph) => {
          const isExplored = exploredParagraphs.has(paragraph.index);
          return (
            <div
              key={paragraph.id}
              data-paragraph-index={paragraph.index}
              onMouseDown={handleParagraphMouseDown}
              onMouseUp={(e) => handleParagraphMouseUp(e, paragraph)}
              className={`paragraph ${
                selectedParagraph === paragraph.index ? 'selected' : ''
              } ${isExplored ? 'explored' : ''}`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onParagraphClick(paragraph.index);
                }
              }}
            >
              {paragraph.text}
            </div>
          );
        })}
      </div>

      {/* End marker */}
      <div className="reader-container text-center py-16">
        <div 
          className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full"
          style={{ 
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-secondary)',
          }}
        >
          <span>✓</span>
          <span>End of article</span>
        </div>
      </div>
    </article>
  );
}
