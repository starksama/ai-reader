import { NextRequest, NextResponse } from 'next/server';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Fetch the URL
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AI-Reader/1.0)',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.status}` },
        { status: 400 }
      );
    }

    const html = await response.text();

    // Parse with Readability
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) {
      return NextResponse.json(
        { error: 'Could not parse article content' },
        { status: 400 }
      );
    }

    // Split content into paragraphs
    const contentDom = new JSDOM(article.content || '');
    const paragraphs = Array.from(
      contentDom.window.document.querySelectorAll('p')
    )
      .map((p, index) => ({
        id: `p-${index}`,
        index,
        text: p.textContent?.trim() || '',
        html: p.innerHTML,
      }))
      .filter((p) => p.text.length > 20); // Filter out tiny paragraphs

    return NextResponse.json({
      title: article.title,
      byline: article.byline,
      siteName: article.siteName,
      excerpt: article.excerpt,
      paragraphs,
      url,
    });
  } catch (error) {
    console.error('Parse error:', error);
    return NextResponse.json(
      { error: 'Failed to parse article' },
      { status: 500 }
    );
  }
}
