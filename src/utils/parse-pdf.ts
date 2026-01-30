import type { ParsedArticle } from './parse-content';

export interface ParsedPDF extends ParsedArticle {
  pageCount: number;
  sourceType: 'pdf';
}

/**
 * Parse PDF file into paragraphs
 */
export async function parsePDF(file: File): Promise<ParsedPDF> {
  // Dynamic import to avoid SSR issues (pdfjs-dist uses browser APIs)
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  const textContent: string[] = [];
  
  // Extract text from each page
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    
    textContent.push(pageText);
  }
  
  // Combine all text and split into paragraphs
  const fullText = textContent.join('\n\n');
  
  // Split by double newlines or sentence boundaries for long text
  const rawParagraphs = fullText
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
  
  // If we got very few paragraphs, try splitting by sentences
  let paragraphTexts = rawParagraphs;
  if (rawParagraphs.length < 5 && fullText.length > 1000) {
    // Split long text by sentences (roughly)
    paragraphTexts = fullText
      .split(/(?<=[.!?])\s+(?=[A-Z])/)
      .reduce((acc: string[], sentence, i) => {
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
    .filter(p => p.text.length > 30);
  
  // Try to extract title from filename or first line
  const title = file.name.replace(/\.pdf$/i, '') || 
                (paragraphs[0]?.text.slice(0, 100) + '...') || 
                'PDF Document';
  
  return {
    title,
    paragraphs,
    url: `pdf:${file.name}`,
    wordCount: paragraphs.reduce((acc, p) => acc + p.text.split(/\s+/).length, 0),
    pageCount: pdf.numPages,
    sourceType: 'pdf',
  };
}
