'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useTextSelection } from '@/hooks/use-text-selection';
import { useHighlightStore, type Highlight } from '@/stores/highlight-store';
import { ActionMenu, type ActionMenuMode } from './action-menu';
import { HighlightedText } from './highlighted-text';

// ============================================================================
// Types
// ============================================================================

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

/**
 * Unified menu state for all interaction types:
 * - selection: User selected text
 * - paragraph: User clicked on a paragraph (no selection)
 * - highlight: User clicked on an existing highlight
 */
interface MenuState {
  isOpen: boolean;
  mode: ActionMenuMode;
  text: string;
  paragraphIndex: number;
  position: { x: number; y: number };
  highlight?: Highlight;
}

const initialMenuState: MenuState = {
  isOpen: false,
  mode: 'selection',
  text: '',
  paragraphIndex: -1,
  position: { x: 0, y: 0 },
};

// ============================================================================
// Component
// ============================================================================

export function ArticleView({ 
  article, 
  selectedParagraph, 
  exploredParagraphs = new Set(),
  onParagraphClick,
  onSelectionAsk,
}: ArticleViewProps) {
  // ---------------------------------------------------------------------------
  // State & Hooks
  // ---------------------------------------------------------------------------
  
  const [readProgress, setReadProgress] = useState(0);
  const [menu, setMenu] = useState<MenuState>(initialMenuState);
  const [isMobile, setIsMobile] = useState(false);
  
  const { selection, clearSelection, getSelectionRect } = useTextSelection();
  const { addHighlight, getHighlights, removeHighlight } = useHighlightStore();
  const highlights = getHighlights(article.url);
  
  // Track mouse position for paragraph click detection
  const mouseDownRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // ---------------------------------------------------------------------------
  // Device Detection
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const checkMobile = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isTouchDevice && isSmallScreen);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ---------------------------------------------------------------------------
  // Scroll Progress
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Text Selection → Menu
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!selection.text || selection.paragraphIndex === null) {
      return;
    }

    // Get fresh rect from current selection (not stored range)
    const rect = getSelectionRect();
    if (!rect) return;

    // Calculate menu position
    const menuWidth = 300;
    const menuHeight = 60;
    const padding = 12;
    
    let x = rect.left + rect.width / 2 - menuWidth / 2;
    let y = rect.top - menuHeight - 8;
    
    // Keep within viewport
    if (x < padding) x = padding;
    if (x + menuWidth > window.innerWidth - padding) {
      x = window.innerWidth - menuWidth - padding;
    }
    if (y < padding) {
      y = rect.bottom + 8;
    }

    // Slight delay on mobile to let native selection UI settle
    const delay = isMobile ? 100 : 0;
    const timer = setTimeout(() => {
      setMenu({
        isOpen: true,
        mode: 'selection',
        text: selection.text,
        paragraphIndex: selection.paragraphIndex!,
        position: { x, y },
      });
    }, delay);
    
    return () => clearTimeout(timer);
  }, [selection.text, selection.paragraphIndex, getSelectionRect, isMobile]);

  // ---------------------------------------------------------------------------
  // Menu Actions
  // ---------------------------------------------------------------------------

  const closeMenu = useCallback(() => {
    setMenu(initialMenuState);
    clearSelection();
  }, [clearSelection]);

  const handleDiveDeeper = useCallback(() => {
    if (onSelectionAsk) {
      onSelectionAsk(menu.text, menu.paragraphIndex);
    } else {
      onParagraphClick(menu.paragraphIndex, menu.text);
    }
  }, [menu.text, menu.paragraphIndex, onSelectionAsk, onParagraphClick]);

  const handleHighlight = useCallback(() => {
    addHighlight(article.url, {
      paragraphIndex: menu.paragraphIndex,
      text: menu.text,
      startOffset: 0,
      endOffset: menu.text.length,
    });
  }, [addHighlight, article.url, menu.paragraphIndex, menu.text]);

  const handleCopy = useCallback(() => {
    // Actual copy is handled in ActionMenu
  }, []);

  const handleEditHighlight = useCallback(() => {
    // TODO: Implement highlight editing
    console.log('Edit highlight:', menu.highlight?.id);
  }, [menu.highlight]);

  const handleDeleteHighlight = useCallback(() => {
    if (menu.highlight) {
      removeHighlight(article.url, menu.highlight.id);
    }
  }, [menu.highlight, removeHighlight, article.url]);

  // ---------------------------------------------------------------------------
  // Highlight Click → Menu
  // ---------------------------------------------------------------------------

  const handleHighlightClick = useCallback((highlight: Highlight, position: { x: number; y: number }) => {
    setMenu({
      isOpen: true,
      mode: 'highlight',
      text: highlight.text,
      paragraphIndex: highlight.paragraphIndex,
      position,
      highlight,
    });
  }, []);

  // ---------------------------------------------------------------------------
  // Paragraph Click Detection
  // ---------------------------------------------------------------------------

  const handleParagraphMouseDown = useCallback((e: React.MouseEvent) => {
    mouseDownRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    };
  }, []);

  const handleParagraphMouseUp = useCallback((e: React.MouseEvent, paragraph: Paragraph) => {
    const mouseDown = mouseDownRef.current;
    if (!mouseDown) return;

    // Check if this was a click (not a drag)
    const dx = Math.abs(e.clientX - mouseDown.x);
    const dy = Math.abs(e.clientY - mouseDown.y);
    const dt = Date.now() - mouseDown.time;

    // If user dragged or held too long, it's not a click
    if (dx > 10 || dy > 10 || dt > 300) {
      mouseDownRef.current = null;
      return;
    }

    // Delay to check if text was selected
    setTimeout(() => {
      const sel = window.getSelection();
      const hasSelection = sel && sel.toString().trim().length > 0;

      if (!hasSelection) {
        // Pure click on paragraph (no selection)
        setMenu({
          isOpen: true,
          mode: 'paragraph',
          text: paragraph.text,
          paragraphIndex: paragraph.index,
          position: { x: e.clientX, y: e.clientY + 10 },
        });
      }
      mouseDownRef.current = null;
    }, 50);
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

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

      {/* Unified Action Menu */}
      <ActionMenu
        isOpen={menu.isOpen}
        mode={menu.mode}
        text={menu.text}
        position={menu.position}
        isMobile={isMobile}
        onDiveDeeper={handleDiveDeeper}
        onHighlight={menu.mode !== 'highlight' ? handleHighlight : undefined}
        onCopy={handleCopy}
        onEdit={menu.mode === 'highlight' ? handleEditHighlight : undefined}
        onDelete={menu.mode === 'highlight' ? handleDeleteHighlight : undefined}
        onClose={closeMenu}
      />

      {/* Header */}
      <header className="reader-container pt-8 pb-6">
        <h1 
          className="text-2xl md:text-3xl font-semibold mb-4 leading-tight tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          {article.title}
        </h1>
        
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

      {/* Article Content */}
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
                if (e.key === 'Enter') onParagraphClick(paragraph.index);
              }}
            >
              <HighlightedText
                text={paragraph.text}
                highlights={paragraphHighlights}
                onHighlightClick={handleHighlightClick}
              />
            </div>
          );
        })}
      </div>

      {/* End Card */}
      <div className="reader-container py-12">
        <div 
          className="p-6 rounded-xl text-center"
          style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
        >
          <p className="text-sm font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
            Finished reading
          </p>
          
          <p className="text-xs mb-6" style={{ color: 'var(--text-secondary)' }}>
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
                onClick={() => onSelectionAsk?.(q, 0)}
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
            {exploredCount > 0 && <><span>·</span><span>{exploredCount} explored</span></>}
            {highlightCount > 0 && <><span>·</span><span>{highlightCount} highlights</span></>}
          </div>
        </div>
      </div>
    </article>
  );
}
