'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useTextSelection } from '@/hooks/use-text-selection';
import { useHighlightStore } from '@/stores/highlight-store';
import { SelectionMenu } from './selection-menu';
import { ParagraphMenu } from './paragraph-menu';
import { HighlightedText } from './highlighted-text';

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
  const { addHighlight, getHighlights, removeHighlight } = useHighlightStore();
  const highlights = getHighlights(article.url);
  
  // State for editing highlights
  const [editingHighlight, setEditingHighlight] = useState<string | null>(null);
  
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
        paragraphText={paragraphMenu.text}
        position={paragraphMenu.position}
        onDiveDeeper={() => {
          onParagraphClick(paragraphMenu.index);
          closeParagraphMenu();
        }}
        onHighlight={() => {
          addHighlight(article.url, {
            paragraphIndex: paragraphMenu.index,
            text: paragraphMenu.text,
            startOffset: 0,
            endOffset: paragraphMenu.text.length,
          });
          closeParagraphMenu();
        }}
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
              <HighlightedText
                text={paragraph.text}
                highlights={paragraphHighlights}
                onDiveDeeper={(text) => {
                  if (onSelectionAsk) {
                    onSelectionAsk(text, paragraph.index);
                  } else {
                    onParagraphClick(paragraph.index, text);
                  }
                }}
                onEditHighlight={(highlight) => {
                  // For now, just allow re-selecting - TODO: implement proper edit
                  setEditingHighlight(highlight.id);
                }}
                onDeleteHighlight={(highlightId) => {
                  removeHighlight(article.url, highlightId);
                }}
              />
            </div>
          );
        })}
      </div>

      {/* End + Follow-up Questions */}
      <div className="reader-container py-12">
        <div 
          className="p-6 rounded-xl text-center"
          style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
        >
          <p 
            className="text-sm font-medium mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            Finished reading
          </p>
          
          <p 
            className="text-xs mb-6"
            style={{ color: 'var(--text-secondary)' }}
          >
            Continue exploring with these questions:
          </p>
          
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {[
              "What's the main takeaway?",
              "How does this apply to me?",
              "What questions remain?",
            ].map((q) => (
              <button
                key={q}
                onClick={() => {
                  // Find the first paragraph and ask about the whole article
                  if (onSelectionAsk) {
                    onSelectionAsk(q, 0);
                  }
                }}
                className="px-4 py-2 text-sm rounded-full transition-all hover:scale-105"
                style={{
                  backgroundColor: 'var(--accent-subtle)',
                  color: 'var(--accent)',
                  border: '1px solid var(--accent)',
                }}
              >
                {q}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span>{readProgress}% read</span>
            {exploredCount > 0 && (
              <>
                <span>·</span>
                <span>{exploredCount} explored</span>
              </>
            )}
            {highlightCount > 0 && (
              <>
                <span>·</span>
                <span>{highlightCount} highlights</span>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
