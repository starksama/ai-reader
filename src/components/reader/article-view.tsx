'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useTextSelection } from '@/hooks/use-text-selection';
import { useHighlightStore } from '@/stores/highlight-store';
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
  const { addHighlight, getHighlights } = useHighlightStore();
  const highlights = getHighlights(article.url);
  
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

  const mouseDownRef = useRef<{ x: number; y: number; time: number } | null>(null);

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

  const handleHighlight = (text: string, paragraphIndex: number) => {
    addHighlight(article.url, {
      paragraphIndex,
      text,
      startOffset: 0,
      endOffset: text.length,
    });
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

    const dx = Math.abs(e.clientX - mouseDown.x);
    const dy = Math.abs(e.clientY - mouseDown.y);
    const dt = Date.now() - mouseDown.time;

    if (dx > 10 || dy > 10 || dt > 300) {
      mouseDownRef.current = null;
      return;
    }

    setTimeout(() => {
      const sel = window.getSelection();
      const hasSelection = sel && sel.toString().trim().length > 0;

      if (!hasSelection) {
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
  const highlightCount = highlights.length;

  return (
    <article className="pb-20">
      {/* Progress Bar */}
      <div 
        className="fixed top-0 left-0 right-0 h-px z-50"
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

      {/* Selection Menu */}
      <SelectionMenu
        selection={selection}
        onDiveDeeper={handleDiveDeeper}
        onHighlight={handleHighlight}
        onCopy={() => {}}
        onClear={clearSelection}
      />

      {/* Paragraph Menu */}
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
          className="text-2xl md:text-3xl font-semibold mb-4 leading-tight tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          {article.title}
        </h1>
        
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {article.byline && <span>{article.byline}</span>}
          {article.siteName && (
            <>
              <span className="opacity-30">·</span>
              <span>{article.siteName}</span>
            </>
          )}
          {article.wordCount && (
            <>
              <span className="opacity-30">·</span>
              <span>{Math.ceil(article.wordCount / 200)} min</span>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <span>{readProgress}%</span>
          {exploredCount > 0 && (
            <>
              <span className="opacity-30">·</span>
              <span>{exploredCount} explored</span>
            </>
          )}
          {highlightCount > 0 && (
            <>
              <span className="opacity-30">·</span>
              <span>{highlightCount} highlighted</span>
            </>
          )}
        </div>
      </header>

      {/* Paragraphs */}
      <div className="reader-container reader-text">
        {article.paragraphs.map((paragraph) => {
          const isExplored = exploredParagraphs.has(paragraph.index);
          const paragraphHighlights = highlights.filter(h => h.paragraphIndex === paragraph.index);
          
          return (
            <div
              key={paragraph.id}
              data-paragraph-index={paragraph.index}
              onMouseDown={handleParagraphMouseDown}
              onMouseUp={(e) => handleParagraphMouseUp(e, paragraph)}
              className={`paragraph ${
                selectedParagraph === paragraph.index ? 'selected' : ''
              } ${isExplored ? 'explored' : ''} ${paragraphHighlights.length > 0 ? 'has-highlight' : ''}`}
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

      {/* End */}
      <div className="reader-container text-center py-16">
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          End
        </span>
      </div>
    </article>
  );
}
