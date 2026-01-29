'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronUp, ChevronDown, Send } from 'lucide-react';
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
    
    await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 400));
    
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
        <div className="reader-container py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm transition-opacity hover:opacity-70"
            style={{ color: 'var(--accent)' }}
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>
          
          {/* Branch navigation */}
          {onNavigate && exploredParagraphs.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                {currentExploredIndex + 1}/{exploredParagraphs.length}
              </span>
              <div className="flex">
                <button
                  onClick={() => canGoPrev && onNavigate(exploredParagraphs[currentExploredIndex - 1])}
                  disabled={!canGoPrev}
                  className="w-6 h-6 flex items-center justify-center transition-all disabled:opacity-20"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={() => canGoNext && onNavigate(exploredParagraphs[currentExploredIndex + 1])}
                  disabled={!canGoNext}
                  className="w-6 h-6 flex items-center justify-center transition-all disabled:opacity-20"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <ChevronDown size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="reader-container py-6">
        {/* Selected text */}
        {selectedText && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 rounded-sm"
            style={{ 
              backgroundColor: 'var(--accent-subtle)', 
              borderLeft: '2px solid var(--accent)',
            }}
          >
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>
              Selection
            </p>
            <p className="leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              "{selectedText}"
            </p>
          </motion.div>
        )}

        {/* Full paragraph */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-4 mb-6 rounded-sm"
          style={{ 
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>
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
            className="mb-6 flex flex-wrap gap-2"
          >
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => {
                  setQuestion(q);
                  inputRef.current?.focus();
                }}
                className="px-3 py-1.5 text-sm rounded-sm transition-all hover:opacity-70"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                }}
              >
                {q}
              </button>
            ))}
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
                    className="text-xs px-1.5 py-0.5"
                    style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                  >
                    Q
                  </span>
                  <p className="mt-1.5" style={{ color: 'var(--text-primary)' }}>{item.q}</p>
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
            className="flex gap-2 rounded-sm overflow-hidden"
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
              className="px-4 py-2.5 text-sm text-white transition-all hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <Send size={14} />
            </button>
          </div>
        </motion.div>
      </div>

      <Toast message={toast.message} isVisible={toast.visible} onHide={hideToast} />
    </motion.div>
  );
}
