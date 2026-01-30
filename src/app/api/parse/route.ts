import { NextRequest, NextResponse } from 'next/server';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

/**
 * Parse article content from URL
 * 
 * Strategy:
 * 1. Try Jina Reader first (free, reliable, returns markdown)
 * 2. Fall back to direct fetch + Readability if Jina fails
 */

interface ParsedParagraph {
  id: string;
  index: number;
  text: string;
  html: string;
}

// Parse markdown into paragraphs
function parseMarkdownContent(markdown: string, title: string, url: string) {
  // Split by double newlines or headers
  const sections = markdown
    .split(/\n\s*\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  // Clean markdown for display
  const cleanMarkdown = (text: string): string => {
    return text
      .replace(/^#{1,6}\s+/gm, '')           // Remove headers
      .replace(/\*\*([^*]+)\*\*/g, '$1')     // Bold
      .replace(/\*([^*]+)\*/g, '$1')         // Italic
      .replace(/`([^`]+)`/g, '$1')           // Inline code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
      .replace(/^>\s*/gm, '')                // Blockquotes
      .replace(/^[-*+]\s+/gm, '• ')          // Lists
      .replace(/!\[.*?\]\(.*?\)/g, '')       // Remove images
      .trim();
  };

  const paragraphs: ParsedParagraph[] = sections
    .map((text, index) => ({
      id: `p-${index}`,
      index,
      text: cleanMarkdown(text),
      html: text,
    }))
    .filter(p => p.text.length > 30);

  return {
    title,
    paragraphs,
    url,
    wordCount: paragraphs.reduce((acc, p) => acc + p.text.split(/\s+/).length, 0),
  };
}

// Try Jina Reader API (free, reliable)
async function fetchWithJina(url: string) {
  const jinaUrl = `https://r.jina.ai/${url}`;
  
  const response = await fetch(jinaUrl, {
    headers: {
      'Accept': 'text/plain',
    },
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    throw new Error(`Jina returned ${response.status}`);
  }

  const text = await response.text();
  
  // Parse Jina response format
  // Title: ...
  // URL Source: ...
  // Markdown Content:
  // ...
  
  const titleMatch = text.match(/^Title:\s*(.+)$/m);
  const contentStart = text.indexOf('Markdown Content:');
  
  if (contentStart === -1) {
    throw new Error('Invalid Jina response format');
  }
  
  const title = titleMatch?.[1]?.trim() || 'Untitled';
  const markdown = text.slice(contentStart + 'Markdown Content:'.length).trim();
  
  if (markdown.length < 100) {
    throw new Error('Content too short');
  }
  
  return { title, markdown };
}

// Fallback: Direct fetch + Readability
async function fetchDirect(url: string) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Website returned ${response.status}`);
  }

  const html = await response.text();
  
  if (html.length < 500) {
    throw new Error('Page content too short');
  }

  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  if (!article?.content) {
    throw new Error('Could not extract article');
  }

  // Extract paragraphs from HTML
  const contentDom = new JSDOM(article.content);
  const paragraphs = Array.from(contentDom.window.document.querySelectorAll('p'))
    .map((p, index) => ({
      id: `p-${index}`,
      index,
      text: p.textContent?.trim() || '',
      html: p.innerHTML,
    }))
    .filter(p => p.text.length > 30);

  return {
    title: article.title || 'Untitled',
    byline: article.byline,
    siteName: article.siteName,
    excerpt: article.excerpt,
    paragraphs,
    url,
    wordCount: paragraphs.reduce((acc, p) => acc + p.text.split(/\s+/).length, 0),
  };
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Try Jina Reader first
    try {
      console.log('[Parse] Trying Jina Reader for:', url);
      const { title, markdown } = await fetchWithJina(url);
      const result = parseMarkdownContent(markdown, title, url);
      
      if (result.paragraphs.length === 0) {
        throw new Error('No paragraphs extracted');
      }
      
      console.log('[Parse] Jina success:', result.paragraphs.length, 'paragraphs');
      return NextResponse.json(result);
    } catch (jinaError) {
      console.log('[Parse] Jina failed:', jinaError instanceof Error ? jinaError.message : 'Unknown');
    }

    // Fallback to direct fetch
    try {
      console.log('[Parse] Trying direct fetch for:', url);
      const result = await fetchDirect(url);
      
      if (result.paragraphs.length === 0) {
        throw new Error('No paragraphs extracted');
      }
      
      console.log('[Parse] Direct success:', result.paragraphs.length, 'paragraphs');
      return NextResponse.json(result);
    } catch (directError) {
      console.log('[Parse] Direct failed:', directError instanceof Error ? directError.message : 'Unknown');
      
      return NextResponse.json(
        { error: 'Could not fetch article. Try pasting the content instead.' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[Parse] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
