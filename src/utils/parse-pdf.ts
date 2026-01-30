import type { ParsedArticle } from './parse-content';

export interface ParsedPDF extends ParsedArticle {
  pageCount: number;
  sourceType: 'pdf';
}

/**
 * Parse PDF file into paragraphs
 * Uses pdfjs-dist with dynamic import (client-side only)
 */
export async function parsePDF(file: File): Promise<ParsedPDF> {
  // Dynamic import to avoid SSR issues
  const pdfjsLib = await import('pdfjs-dist');
  
  // Disable worker - runs on main thread (slower but reliable)
  pdfjsLib.GlobalWorkerOptions.workerSrc = '';
  
  const arrayBuffer = await file.arrayBuffer();
  
  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
    useSystemFonts: true,
    isEvalSupported: false,
    disableFontFace: true,
  }).promise;
  
  const textContent: string[] = [];
  
  // Extract text from each page
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    
    // Better text extraction - preserve line breaks
    let lastY: number | null = null;
    const lines: string[] = [];
    let currentLine = '';
    
    for (const item of content.items) {
      if (!('str' in item)) continue;
      
      // Check if this is a new line (different Y position)
      const transform = 'transform' in item ? item.transform : null;
      const y = transform ? transform[5] : null;
      
      if (lastY !== null && y !== null && Math.abs(y - lastY) > 5) {
        if (currentLine.trim()) {
          lines.push(currentLine.trim());
        }
        currentLine = item.str;
      } else {
        currentLine += item.str;
      }
      
      lastY = y;
    }
    
    if (currentLine.trim()) {
      lines.push(currentLine.trim());
    }
    
    textContent.push(lines.join('\n'));
  }
  
  // Combine all text
  const fullText = textContent.join('\n\n');
  
  // Split into paragraphs (double newlines or significant gaps)
  const rawParagraphs = fullText
    .split(/\n\s*\n/)
    .map(p => p.replace(/\n/g, ' ').trim())
    .filter(p => p.length > 0);
  
  // If we got very few paragraphs, try splitting by sentences
  let paragraphTexts = rawParagraphs;
  if (rawParagraphs.length < 5 && fullText.length > 1000) {
    paragraphTexts = fullText
      .split(/(?<=[.!?])\s+(?=[A-Z])/)
      .reduce((acc: string[], sentence) => {
        const lastIdx = acc.length - 1;
        if (lastIdx >= 0 && acc[lastIdx].length < 500) {
          acc[lastIdx] += ' ' + sentence;
        } else {
          acc.push(sentence);
        }
        return acc;
      }, [])
      .filter(p => p.trim().length > 50);
  }
  
  const paragraphs = paragraphTexts
    .map((text, index) => ({
      id: `p-${index}`,
      index,
      text: text.trim(),
      html: text.trim(),
    }))
    .filter(p => p.text.length > 20);
  
  // Extract title from filename
  const title = file.name.replace(/\.pdf$/i, '') || 'PDF Document';
  
  return {
    title,
    paragraphs,
    url: `pdf:${file.name}`,
    wordCount: paragraphs.reduce((acc, p) => acc + p.text.split(/\s+/).length, 0),
    pageCount: pdf.numPages,
    sourceType: 'pdf',
  };
}
