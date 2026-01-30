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
  sourceType?: 'url' | 'paste' | 'markdown' | 'html' | 'pdf' | 'file';
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
 * Detect if content is HTML
 */
export function isHTML(content: string): boolean {
  return /<[a-z][\s\S]*>/i.test(content);
}

/**
 * Detect if content is Markdown
 */
export function isMarkdown(content: string): boolean {
  // Check for common markdown patterns
  const markdownPatterns = [
    /^#{1,6}\s+.+$/m,           // Headers: # Title
    /^\s*[-*+]\s+.+$/m,         // Unordered lists
    /^\s*\d+\.\s+.+$/m,         // Ordered lists
    /\[.+\]\(.+\)/,             // Links: [text](url)
    /^>\s+.+$/m,                // Blockquotes
    /```[\s\S]*```/,            // Code blocks
    /`[^`]+`/,                  // Inline code
    /\*\*[^*]+\*\*/,            // Bold
    /\*[^*]+\*/,                // Italic
    /^---+$/m,                  // Horizontal rule
  ];
  
  // If multiple patterns match, it's likely markdown
  const matches = markdownPatterns.filter(p => p.test(content));
  return matches.length >= 2;
}

/**
 * Parse Markdown content into paragraphs
 */
export function parseMarkdown(content: string, title?: string): ParsedArticle {
  // Extract title from first h1 if not provided
  let extractedTitle = title;
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (!extractedTitle && h1Match) {
    extractedTitle = h1Match[1].trim();
  }
  
  // Split by headers and double newlines to create logical sections
  const sections: string[] = [];
  
  // Split by headers (keep header with its content)
  const headerSplit = content.split(/(?=^#{1,6}\s+)/m);
  
  for (const section of headerSplit) {
    if (!section.trim()) continue;
    
    // Further split large sections by double newlines
    const paragraphs = section.split(/\n\s*\n/).filter(p => p.trim());
    sections.push(...paragraphs);
  }
  
  // Clean up markdown syntax for display text
  const cleanMarkdown = (text: string): string => {
    return text
      .replace(/^#{1,6}\s+/gm, '')     // Remove header markers
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Bold
      .replace(/\*([^*]+)\*/g, '$1')     // Italic
      .replace(/`([^`]+)`/g, '$1')       // Inline code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
      .replace(/^>\s*/gm, '')            // Blockquotes
      .replace(/^[-*+]\s+/gm, '• ')      // List items
      .trim();
  };
  
  const paragraphs = sections
    .map((text, index) => ({
      id: `p-${index}`,
      index,
      text: cleanMarkdown(text),
      html: text, // Keep original markdown in html field for potential rendering
    }))
    .filter(p => p.text.length > 20);
  
  return {
    title: extractedTitle || 'Markdown Document',
    paragraphs,
    url: 'markdown-content',
    wordCount: paragraphs.reduce((acc, p) => acc + p.text.split(/\s+/).length, 0),
    sourceType: 'markdown',
  };
}

/**
 * Parse any content (auto-detect HTML vs Markdown vs plain text)
 */
export function parseContent(content: string, title?: string): ParsedArticle | null {
  // Try HTML first (most specific)
  if (isHTML(content)) {
    const result = parseHTML(content, 'pasted-content');
    if (result) {
      result.sourceType = 'html';
      return result;
    }
  }
  
  // Try Markdown
  if (isMarkdown(content)) {
    return parseMarkdown(content, title);
  }
  
  // Fallback to plain text
  const result = parsePlainText(content, title);
  result.sourceType = 'paste';
  return result;
}
