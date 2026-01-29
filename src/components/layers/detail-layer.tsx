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
  exploredParagraphs?: number[];
  onBack: () => void;
  onNavigate?: (index: number) => void;
}

const mockResponses = [
  `This passage makes a key point about the author's argument.

**Core insight:** The author connects this idea to a broader theme.

**Why it matters:** Understanding this helps grasp the overall message.`,

  `Here's what I see in this passage:

The author is building toward a larger point:
• Specific language signals importance
• Connects to earlier ideas
• Sets up what comes next`,

  `Let me break this down.

**Summary:** This serves as a transition, connecting previous ideas to what follows.

**Key takeaway:** The author makes an implicit argument supporting their thesis.`,
];

export function DetailLayer({ 
  paragraph, 
  articleUrl, 
  articleTitle, 
  selectedText, 
  totalParagraphs,
  exploredParagraphs = [],
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

  // Find current position in explored paragraphs for branch navigation
  const currentExploredIndex = exploredParagraphs.indexOf(paragraph.index);
  const canGoPrev = currentExploredIndex > 0;
  const canGoNext = currentExploredIndex < exploredParagraphs.length - 1 && currentExploredIndex !== -1;

  useKeyboardShortcuts({
    onEscape: onBack,
    onPrev: () => {
      if (onNavigate && canGoPrev) {
        onNavigate(exploredParagraphs[currentExploredIndex - 1]);
      }
    },
    onNext: () => {
      if (onNavigate && canGoNext) {
        onNavigate(exploredParagraphs[currentExploredIndex + 1]);
      }
    },
  });

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
    
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
    
    const mockResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    
    setResponse(mockResponse);
    setChatHistory(prev => [...prev, { q: currentQuestion, a: mockResponse }]);
    
    addNote(articleUrl, articleTitle, {
      paragraphIndex: paragraph.index,
      paragraphText: (selectedText || paragraph.text).slice(0, 200) + '...',
      question: currentQuestion,
      answer: mockResponse,
    });
    showToast('Note saved');
    
    setIsAsking(false);
  };

  const suggestedQuestions = [
    "Explain simply",
    "Why important?",
    "Give example",
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Header */}
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
          
          {/* Branch navigation */}
          <div className="flex items-center gap-2">
            {exploredParagraphs.length > 1 && (
              <span className="text-xs tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                {currentExploredIndex + 1} of {exploredParagraphs.length} branches
              </span>
            )}
            {onNavigate && exploredParagraphs.length > 1 && (
              <div className="flex gap-0.5">
                <button
                  onClick={() => canGoPrev && onNavigate(exploredParagraphs[currentExploredIndex - 1])}
                  disabled={!canGoPrev}
                  className="w-7 h-7 rounded flex items-center justify-center text-xs transition-all disabled:opacity-20"
                  style={{ 
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)',
                  }}
                  title="Previous branch"
                >
                  ↑
                </button>
                <button
                  onClick={() => canGoNext && onNavigate(exploredParagraphs[currentExploredIndex + 1])}
                  disabled={!canGoNext}
                  className="w-7 h-7 rounded flex items-center justify-center text-xs transition-all disabled:opacity-20"
                  style={{ 
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)',
                  }}
                  title="Next branch"
                >
                  ↓
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Selected text */}
        {selectedText && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 rounded"
            style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
          >
            <p className="text-xs uppercase tracking-wider mb-2 opacity-70 font-medium">
              Selection
            </p>
            <p className="font-medium leading-relaxed">
              "{selectedText}"
            </p>
          </motion.div>
        )}

        {/* Full paragraph */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-4 rounded mb-6"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <p className="text-xs uppercase tracking-wider mb-2 font-medium" style={{ color: 'var(--text-secondary)' }}>
            {selectedText ? 'Context' : 'Passage'}
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
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setQuestion(q);
                    inputRef.current?.focus();
                  }}
                  className="px-3 py-1.5 rounded text-sm transition-all hover:opacity-80"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border)',
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
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="mb-2">
                  <span 
                    className="text-xs font-medium px-2 py-0.5 rounded"
                    style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                  >
                    Q
                  </span>
                  <p className="mt-1.5 font-medium" style={{ color: 'var(--text-primary)' }}>{item.q}</p>
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

        {/* Input */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="sticky bottom-4 mt-8"
        >
          <div 
            className="flex gap-2 p-1.5 rounded shadow-lg"
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
              placeholder="Ask about this passage..."
              className="flex-1 px-3 py-2.5 bg-transparent outline-none text-sm"
              style={{ color: 'var(--text-primary)' }}
              disabled={isAsking}
            />
            <button
              onClick={handleAsk}
              disabled={isAsking || !question.trim()}
              className="px-4 py-2.5 rounded text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-40"
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
