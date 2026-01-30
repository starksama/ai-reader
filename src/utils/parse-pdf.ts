import type { ParsedArticle } from './parse-content';

export interface ParsedPDF extends ParsedArticle {
  pageCount: number;
  sourceType: 'pdf';
}

interface TextItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontName?: string;
}

/**
 * Parse PDF file into paragraphs with better formatting
 * Uses pdfjs-dist with smart text reconstruction
 */
export async function parsePDF(file: File): Promise<ParsedPDF> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
    useSystemFonts: true,
  }).promise;
  
  const allParagraphs: string[] = [];
  
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1 });
    
    // Extract text items with positioning
    const items: TextItem[] = content.items
      .filter((item): item is typeof item & { str: string; transform: number[] } => 
        'str' in item && 'transform' in item && item.str.trim().length > 0
      )
      .map(item => {
        // @ts-expect-error - pdfjs types are incomplete
        const width = item.width ?? 0;
        // @ts-expect-error - pdfjs types are incomplete  
        const height = item.height ?? Math.abs(item.transform[0]) ?? 12;
        return {
          str: item.str,
          x: item.transform[4],
          y: viewport.height - item.transform[5], // Flip Y (PDF has origin at bottom)
          width,
          height,
          fontName: 'fontName' in item ? String(item.fontName) : undefined,
        };
      });
    
    if (items.length === 0) continue;
    
    // Sort by Y (top to bottom), then X (left to right)
    items.sort((a, b) => {
      const yDiff = a.y - b.y;
      if (Math.abs(yDiff) > 3) return yDiff;
      return a.x - b.x;
    });
    
    // Group into lines based on Y position
    const lines: TextItem[][] = [];
    let currentLine: TextItem[] = [];
    let lastY = items[0]?.y ?? 0;
    const avgHeight = items.reduce((sum, i) => sum + i.height, 0) / items.length;
    
    for (const item of items) {
      // New line if Y changed significantly (more than half line height)
      if (currentLine.length > 0 && Math.abs(item.y - lastY) > avgHeight * 0.5) {
        lines.push(currentLine);
        currentLine = [];
      }
      currentLine.push(item);
      lastY = item.y;
    }
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }
    
    // Build text from lines with smart spacing
    const pageLines: string[] = [];
    
    for (const line of lines) {
      // Sort line items by X position
      line.sort((a, b) => a.x - b.x);
      
      let lineText = '';
      let lastEndX = 0;
      
      for (const item of line) {
        // Add space if there's a gap between items
        const gap = item.x - lastEndX;
        if (lineText.length > 0 && gap > avgHeight * 0.3) {
          lineText += ' ';
        }
        lineText += item.str;
        lastEndX = item.x + item.width;
      }
      
      pageLines.push(lineText.trim());
    }
    
    // Detect paragraphs based on line spacing and indentation
    const paragraphs: string[] = [];
    let currentParagraph = '';
    let lastLineY = 0;
    
    for (let i = 0; i < pageLines.length; i++) {
      const lineText = pageLines[i];
      if (!lineText) continue;
      
      const lineY = lines[i]?.[0]?.y ?? 0;
      const lineGap = lineY - lastLineY;
      
      // Start new paragraph if:
      // - Large gap between lines (> 1.5x average line height)
      // - Line starts with common paragraph indicators
      // - Previous line ends with sentence-ending punctuation and this starts with capital
      const isLargeGap = lastLineY > 0 && lineGap > avgHeight * 1.8;
      const startsNewParagraph = /^[•●○▪▸►\-–—\d+\.\)]/.test(lineText);
      const prevEndsSentence = currentParagraph.match(/[.!?]["']?\s*$/);
      const startsWithCapital = /^[A-Z]/.test(lineText);
      
      if (currentParagraph && (isLargeGap || startsNewParagraph || (prevEndsSentence && startsWithCapital && lineGap > avgHeight * 1.2))) {
        paragraphs.push(cleanParagraph(currentParagraph));
        currentParagraph = lineText;
      } else {
        // Continue paragraph - handle hyphenation
        if (currentParagraph.endsWith('-')) {
          currentParagraph = currentParagraph.slice(0, -1) + lineText;
        } else {
          currentParagraph += (currentParagraph ? ' ' : '') + lineText;
        }
      }
      
      lastLineY = lineY;
    }
    
    if (currentParagraph) {
      paragraphs.push(cleanParagraph(currentParagraph));
    }
    
    allParagraphs.push(...paragraphs);
  }
  
  // Filter out likely headers/footers (very short, repeated across pages)
  const filtered = allParagraphs
    .filter(p => p.length > 30) // Skip very short items
    .filter(p => !/^(page\s+)?\d+(\s+of\s+\d+)?$/i.test(p)) // Skip page numbers
    .filter(p => !/^\d+$/.test(p)); // Skip standalone numbers
  
  const paragraphs = filtered.map((text, index) => ({
    id: `p-${index}`,
    index,
    text,
    html: text,
  }));
  
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

/**
 * Clean up paragraph text
 */
function cleanParagraph(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/([a-z])-\s+([a-z])/gi, '$1$2') // Fix remaining hyphenation
    .replace(/\s+([.,;:!?])/g, '$1') // Fix punctuation spacing
    .replace(/([.,;:!?])([A-Za-z])/g, '$1 $2') // Add space after punctuation
    .trim();
}
