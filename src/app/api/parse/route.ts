import { NextRequest, NextResponse } from 'next/server';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format. Please enter a valid http or https URL.' },
        { status: 400 }
      );
    }

    // Fetch the URL with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    let response: Response;
    try {
      response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AI-Reader/1.0; +https://github.com/starksama/ai-reader)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        signal: controller.signal,
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timed out. The website took too long to respond.' },
          { status: 408 }
        );
      }
      return NextResponse.json(
        { error: 'Could not connect to the website. It may be blocking requests or temporarily unavailable.' },
        { status: 502 }
      );
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: `Website returned error ${response.status}. The page may not exist or requires authentication.` },
        { status: 400 }
      );
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      return NextResponse.json(
        { error: 'This URL does not point to an HTML page. AI Reader works best with articles and blog posts.' },
        { status: 400 }
      );
    }

    const html = await response.text();

    if (html.length < 500) {
      return NextResponse.json(
        { error: 'Page content is too short. This might be a redirect or empty page.' },
        { status: 400 }
      );
    }

    // Parse with Readability
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article || !article.content) {
      return NextResponse.json(
        { error: 'Could not extract article content. This page might not be a standard article format.' },
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
      .filter((p) => p.text.length > 30); // Filter out tiny paragraphs

    if (paragraphs.length === 0) {
      return NextResponse.json(
        { error: 'No readable paragraphs found. The page structure might not be supported.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      title: article.title || 'Untitled Article',
      byline: article.byline,
      siteName: article.siteName,
      excerpt: article.excerpt,
      paragraphs,
      url,
      wordCount: paragraphs.reduce((acc, p) => acc + p.text.split(/\s+/).length, 0),
    });
  } catch (error) {
    console.error('Parse error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while parsing the article. Please try again.' },
      { status: 500 }
    );
  }
}
