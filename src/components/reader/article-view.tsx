'use client';

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
}

interface ArticleViewProps {
  article: Article;
  selectedParagraph: number | null;
  onParagraphClick: (index: number) => void;
}

export function ArticleView({ article, selectedParagraph, onParagraphClick }: ArticleViewProps) {
  return (
    <article className="reader-container pb-20">
      {/* Header */}
      <header className="mb-8">
        <h1 
          className="text-2xl md:text-3xl font-bold mb-3"
          style={{ color: 'var(--text-primary)' }}
        >
          {article.title}
        </h1>
        {article.byline && (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {article.byline}
          </p>
        )}
        {article.siteName && (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {article.siteName}
          </p>
        )}
      </header>

      {/* Progress */}
      <div 
        className="mb-6 text-sm"
        style={{ color: 'var(--text-secondary)' }}
      >
        {article.paragraphs.length} paragraphs · Tap any to explore
      </div>

      {/* Paragraphs */}
      <div className="reader-text">
        {article.paragraphs.map((paragraph) => (
          <div
            key={paragraph.id}
            onClick={() => onParagraphClick(paragraph.index)}
            className={`paragraph ${
              selectedParagraph === paragraph.index ? 'selected' : ''
            }`}
          >
            {paragraph.text}
          </div>
        ))}
      </div>
    </article>
  );
}
