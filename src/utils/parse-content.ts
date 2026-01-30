import { Readability } from '@mozilla/readability';

export interface ParsedArticle {
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
  wordCount?: number;
}

/**
 * Parse HTML content client-side using Readability
 */
export function parseHTML(html: string, url: string = 'pasted-content'): ParsedArticle | null {
  try {
    // Create a DOM from the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Use Readability to extract article
    const reader = new Readability(doc);
    const article = reader.parse();
    
    if (!article || !article.content) {
      return null;
    }
    
    // Extract paragraphs
    const contentDoc = parser.parseFromString(article.content, 'text/html');
    const paragraphs = Array.from(contentDoc.querySelectorAll('p'))
      .map((p, index) => ({
        id: `p-${index}`,
        index,
        text: p.textContent?.trim() || '',
        html: p.innerHTML,
      }))
      .filter((p) => p.text.length > 30);
    
    if (paragraphs.length === 0) {
      return null;
    }
    
    return {
      title: article.title || 'Untitled',
      byline: article.byline || undefined,
      siteName: article.siteName || undefined,
      excerpt: article.excerpt || undefined,
      paragraphs,
      url,
      wordCount: paragraphs.reduce((acc, p) => acc + p.text.split(/\s+/).length, 0),
    };
  } catch (error) {
    console.error('Client-side parse error:', error);
    return null;
  }
}

/**
 * Parse plain text content (not HTML)
 * Splits by double newlines into paragraphs
 */
export function parsePlainText(text: string, title: string = 'Pasted Content'): ParsedArticle {
  // Split by double newlines or multiple newlines
  const rawParagraphs = text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
  
  // If no paragraph breaks, try single newlines
  const paragraphTexts = rawParagraphs.length > 1 
    ? rawParagraphs 
    : text.split(/\n/).map(p => p.trim()).filter(p => p.length > 30);
  
  const paragraphs = paragraphTexts.map((text, index) => ({
    id: `p-${index}`,
    index,
    text,
    html: text,
  }));
  
  return {
    title,
    paragraphs,
    url: 'pasted-content',
    wordCount: paragraphs.reduce((acc, p) => acc + p.text.split(/\s+/).length, 0),
  };
}

/**
 * Detect if content is HTML or plain text
 */
export function isHTML(content: string): boolean {
  return /<[a-z][\s\S]*>/i.test(content);
}

/**
 * Parse any content (auto-detect HTML vs plain text)
 */
export function parseContent(content: string, title?: string): ParsedArticle | null {
  if (isHTML(content)) {
    return parseHTML(content, 'pasted-content');
  } else {
    return parsePlainText(content, title);
  }
}
