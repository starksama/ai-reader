'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AsyncResponse } from '@/components/async/async-response';
import { useNotesStore } from '@/stores/notes-store';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { Toast, useToast } from '@/components/ui/toast';

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
  selectedText?: string;
  totalParagraphs: number;
  onBack: () => void;
  onNavigate?: (index: number) => void;
}

// Mock responses
const mockResponses = [
  `This passage makes a key point about the author's main argument. Let me break it down:

**Core insight:** The author is connecting this idea to a broader theme in the article.

**Why it matters:** Understanding this helps you grasp the overall message.

Would you like me to explore any specific part further?`,

  `Great question! Here's what I see in this passage:

The author is building toward a larger point. Notice how they:
• Use specific language to signal importance
• Connect this to earlier ideas
• Set up what comes next

What would you like to explore next?`,

  `Let me help you understand this better.

**Summary:** This serves as a transition point, connecting previous ideas to what follows.

**Key takeaway:** The author is making an implicit argument here that supports their main thesis.

Any follow-up questions?`,
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
  const { toast, show: showToast, hide: hideToast } = useToast();

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

  // Scroll to top and focus input
  useEffect(() => {
    inputRef.current?.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [paragraph.index]);

  const handleAsk = async () => {
    if (!question.trim() || isAsking) return;
    
    const currentQuestion = question;
    setQuestion('');
    setIsAsking(true);
    setResponse(null);
    
    // Simulate thinking delay
    await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 600));
    
    const mockResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    
    setResponse(mockResponse);
    setChatHistory(prev => [...prev, { q: currentQuestion, a: mockResponse }]);
    
    // Save note
    addNote(articleUrl, articleTitle, {
      paragraphIndex: paragraph.index,
      paragraphText: (selectedText || paragraph.text).slice(0, 200) + '...',
      question: currentQuestion,
      answer: mockResponse,
    });
    showToast('📝 Note saved');
    
    setIsAsking(false);
  };

  const suggestedQuestions = [
    "Explain this simply",
    "Why is this important?",
    "Give me an example",
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Minimal header */}
      <div 
        className="sticky top-0 z-10 border-b"
        style={{ 
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: 'var(--accent)' }}
          >
            <span>←</span>
            <span>Back</span>
          </button>
          
          {/* Paragraph navigation */}
          <div className="flex items-center gap-3">
            <span className="text-xs tabular-nums" style={{ color: 'var(--text-secondary)' }}>
              {paragraph.index + 1} / {totalParagraphs}
            </span>
            {onNavigate && (
              <div className="flex gap-1">
                <button
                  onClick={() => onNavigate(paragraph.index - 1)}
                  disabled={paragraph.index === 0}
                  className="w-7 h-7 rounded-md flex items-center justify-center text-sm transition-all disabled:opacity-30 hover:bg-[var(--highlight)]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  ↑
                </button>
                <button
                  onClick={() => onNavigate(paragraph.index + 1)}
                  disabled={paragraph.index >= totalParagraphs - 1}
                  className="w-7 h-7 rounded-md flex items-center justify-center text-sm transition-all disabled:opacity-30 hover:bg-[var(--highlight)]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  ↓
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Selected text highlight */}
        {selectedText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 rounded-xl"
            style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
          >
            <p className="text-xs uppercase tracking-wide mb-2 opacity-70 font-medium">
              Your selection
            </p>
            <p className="text-lg font-medium leading-relaxed">
              "{selectedText}"
            </p>
          </motion.div>
        )}

        {/* Full paragraph context */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-4 rounded-xl mb-8"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <p className="text-xs uppercase tracking-wide mb-2 font-medium" style={{ color: 'var(--text-secondary)' }}>
            {selectedText ? 'Full context' : 'Selected passage'}
          </p>
          <p className="leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            {paragraph.text}
          </p>
        </motion.div>

        {/* Suggested questions */}
        {chatHistory.length === 0 && !isAsking && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <p className="text-xs uppercase tracking-wide mb-3 font-medium" style={{ color: 'var(--text-secondary)' }}>
              Quick questions
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setQuestion(q);
                    inputRef.current?.focus();
                  }}
                  className="px-3 py-2 rounded-lg text-sm transition-all hover:scale-105"
                  style={{
                    backgroundColor: 'var(--highlight)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Chat history */}
        {chatHistory.length > 0 && (
          <div className="space-y-4 mb-6">
            {chatHistory.map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="mb-2">
                  <span className="text-xs font-medium px-2 py-1 rounded" style={{ backgroundColor: 'var(--highlight)', color: 'var(--text-secondary)' }}>
                    You asked
                  </span>
                  <p className="mt-2 font-medium" style={{ color: 'var(--text-primary)' }}>{item.q}</p>
                </div>
                <AsyncResponse isLoading={false} response={item.a} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Current response */}
        {(isAsking || response) && chatHistory.length === 0 && (
          <div className="mb-6">
            <AsyncResponse isLoading={isAsking} response={response} />
          </div>
        )}

        {/* Input area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="sticky bottom-4 mt-8"
        >
          <div 
            className="flex gap-2 p-2 rounded-xl shadow-lg"
            style={{ 
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border)',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              placeholder="Ask anything about this passage..."
              className="flex-1 px-4 py-3 bg-transparent outline-none text-sm"
              style={{ color: 'var(--text-primary)' }}
              disabled={isAsking}
            />
            <button
              onClick={handleAsk}
              disabled={isAsking || !question.trim()}
              className="px-5 py-3 rounded-lg font-medium text-sm text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {isAsking ? '...' : 'Ask'}
            </button>
          </div>
        </motion.div>
      </div>

      <Toast message={toast.message} isVisible={toast.visible} onHide={hideToast} />
    </motion.div>
  );
}
