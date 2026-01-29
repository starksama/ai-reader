'use client';

import { useState, useRef, useEffect } from 'react';
import { AsyncResponse } from '@/components/async/async-response';
import { useNotesStore } from '@/stores/notes-store';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

interface Paragraph {
  id: string;
  index: number;
  text: string;
  html: string;
}

interface DetailLayerProps {
  paragraph: Paragraph;
  articleUrl: string;
  articleTitle: string;
  selectedText?: string; // Text user selected within the paragraph
  totalParagraphs: number;
  onBack: () => void;
  onNavigate?: (index: number) => void;
}

// Mock responses based on common question types
const mockResponses = [
  `This paragraph establishes a key concept that's central to the article's argument. Let me break it down:

**Main idea:** The author is making a point about how this topic relates to the broader context.

**Why it matters:** This sets up the foundation for what comes next in the article.

**Key terms:** Look for specific terminology that the author uses repeatedly — these are usually important.

Would you like me to explain any specific part in more detail?`,

  `Great question! Here's what I understand from this passage:

The author is discussing a nuanced point here. The key insight is that they're not just stating facts, but building toward a larger argument.

**Context clues:**
• Notice the language choices — they signal the author's perspective
• This connects to earlier points made in the article
• The structure suggests this is a supporting argument

What aspect would you like to explore further?`,

  `Let me help you understand this better.

**Summary:** This paragraph serves as a transition point in the article, connecting previous ideas to what comes next.

**Deeper analysis:**
1. The author uses specific examples to illustrate their point
2. There's an implicit assumption being made here
3. This ties back to the article's central thesis

**For further exploration:** Consider how this relates to the paragraphs before and after it.

Any specific questions about this passage?`,
];

export function DetailLayer({ 
  paragraph, 
  articleUrl, 
  articleTitle, 
  selectedText, 
  totalParagraphs,
  onBack,
  onNavigate,
}: DetailLayerProps) {
  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<Array<{ q: string; a: string }>>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addNote } = useNotesStore();

  // Keyboard navigation
  useKeyboardShortcuts({
    onEscape: onBack,
    onPrev: () => {
      if (onNavigate && paragraph.index > 0) {
        onNavigate(paragraph.index - 1);
      }
    },
    onNext: () => {
      if (onNavigate && paragraph.index < totalParagraphs - 1) {
        onNavigate(paragraph.index + 1);
      }
    },
  });

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleAsk = async () => {
    if (!question.trim() || isAsking) return;
    
    const currentQuestion = question;
    setQuestion('');
    setIsAsking(true);
    setResponse(null);
    
    // Simulate thinking delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));
    
    // Pick a random mock response
    const mockResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    
    setResponse(mockResponse);
    setChatHistory(prev => [...prev, { q: currentQuestion, a: mockResponse }]);
    
    // Save note
    addNote(articleUrl, articleTitle, {
      paragraphIndex: paragraph.index,
      paragraphText: paragraph.text.slice(0, 200) + (paragraph.text.length > 200 ? '...' : ''),
      question: currentQuestion,
      answer: mockResponse,
    });
    
    setIsAsking(false);
  };

  const suggestedQuestions = [
    "What does this mean?",
    "Why is this important?",
    "Can you simplify this?",
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with back button and navigation */}
      <div 
        className="sticky top-[97px] z-10 px-4 py-3 border-b"
        style={{ 
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: 'var(--accent)' }}
          >
            ← Back
          </button>
          
          {/* Paragraph navigation */}
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {paragraph.index + 1} / {totalParagraphs}
            </span>
            {onNavigate && (
              <div className="flex gap-1">
                <button
                  onClick={() => onNavigate(paragraph.index - 1)}
                  disabled={paragraph.index === 0}
                  className="w-8 h-8 rounded flex items-center justify-center transition-opacity disabled:opacity-30"
                  style={{ backgroundColor: 'var(--bg-secondary)' }}
                  title="Previous paragraph"
                >
                  ↑
                </button>
                <button
                  onClick={() => onNavigate(paragraph.index + 1)}
                  disabled={paragraph.index >= totalParagraphs - 1}
                  className="w-8 h-8 rounded flex items-center justify-center transition-opacity disabled:opacity-30"
                  style={{ backgroundColor: 'var(--bg-secondary)' }}
                  title="Next paragraph"
                >
                  ↓
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 reader-container py-6">
        {/* Selected text highlight */}
        {selectedText && (
          <div
            className="p-4 rounded-lg mb-4 border-l-4"
            style={{
              backgroundColor: 'var(--accent)',
              borderColor: 'var(--accent)',
              opacity: 0.9,
            }}
          >
            <p className="text-xs uppercase tracking-wide mb-2 font-medium text-white/70">
              Your selection
            </p>
            <p className="leading-relaxed text-white font-medium">
              "{selectedText}"
            </p>
          </div>
        )}

        {/* Full paragraph context */}
        <div
          className="p-4 rounded-lg mb-6 border-l-4"
          style={{
            backgroundColor: 'var(--highlight)',
            borderColor: selectedText ? 'var(--border)' : 'var(--accent)',
          }}
        >
          <p className="text-xs uppercase tracking-wide mb-2 font-medium" style={{ color: 'var(--text-secondary)' }}>
            {selectedText ? 'Full paragraph' : 'Selected passage'}
          </p>
          <p className="leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            {paragraph.text}
          </p>
        </div>

        {/* Suggested questions */}
        {chatHistory.length === 0 && !isAsking && (
          <div className="mb-6">
            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
              Try asking:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setQuestion(q);
                    inputRef.current?.focus();
                  }}
                  className="px-3 py-1.5 rounded-full text-sm border transition-colors hover:border-current"
                  style={{ 
                    borderColor: 'var(--border)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat history */}
        {chatHistory.map((chat, idx) => (
          <div key={idx} className="mb-6">
            <div 
              className="text-sm font-medium mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              You asked: {chat.q}
            </div>
            <div 
              className="p-4 rounded-lg prose prose-sm max-w-none"
              style={{ 
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
              }}
            >
              <div className="whitespace-pre-wrap">{chat.a}</div>
            </div>
          </div>
        ))}

        {/* Current response */}
        <AsyncResponse isLoading={isAsking} response={response && chatHistory.length === 0 ? response : null} />
      </div>

      {/* Fixed input at bottom */}
      <div 
        className="sticky bottom-0 p-4 border-t"
        style={{ 
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="max-w-[680px] mx-auto flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            placeholder="Ask about this passage..."
            className="flex-1 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
            disabled={isAsking}
          />
          <button
            onClick={handleAsk}
            disabled={isAsking || !question.trim()}
            className="px-5 py-3 rounded-lg font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {isAsking ? '...' : 'Ask'}
          </button>
        </div>
      </div>
    </div>
  );
}
