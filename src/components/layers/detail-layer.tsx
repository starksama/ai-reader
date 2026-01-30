'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronUp, ChevronDown, Send, ChevronRight } from 'lucide-react';
import { ChatBubble } from '@/components/chat/chat-bubble';
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
  exploredParagraphs = [],
  onBack,
  onNavigate,
}: DetailLayerProps) {
  const [question, setQuestion] = useState('');
  const [pendingQuestion, setPendingQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<Array<{ q: string; a: string }>>([]);
  const [showContext, setShowContext] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addNote } = useNotesStore();
  const { toast, show: showToast, hide: hideToast } = useToast();

  const currentExploredIndex = exploredParagraphs.indexOf(paragraph.index);
  const canGoPrev = currentExploredIndex > 0;
  const canGoNext = currentExploredIndex < exploredParagraphs.length - 1 && currentExploredIndex !== -1;

  // Show full context by default only if no selection
  const hasSelection = !!selectedText;

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
    setPendingQuestion(currentQuestion);
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

  const displayText = selectedText || paragraph.text;

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
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70 -ml-1"
            style={{ color: 'var(--accent)' }}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          
          {/* Branch navigation */}
          {onNavigate && exploredParagraphs.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs tabular-nums" style={{ color: 'var(--text-tertiary)' }}>
                {currentExploredIndex + 1}/{exploredParagraphs.length}
              </span>
              <div className="flex">
                <button
                  onClick={() => canGoPrev && onNavigate(exploredParagraphs[currentExploredIndex - 1])}
                  disabled={!canGoPrev}
                  className="w-7 h-7 flex items-center justify-center transition-all disabled:opacity-20"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  onClick={() => canGoNext && onNavigate(exploredParagraphs[currentExploredIndex + 1])}
                  disabled={!canGoNext}
                  className="w-7 h-7 flex items-center justify-center transition-all disabled:opacity-20"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Main text (selection or passage) */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <p 
            className="text-lg leading-relaxed"
            style={{ color: 'var(--text-primary)' }}
          >
            {hasSelection ? `"${displayText}"` : displayText}
          </p>
        </motion.div>

        {/* Collapsible context (only show when there's a selection) */}
        {hasSelection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="mb-6"
          >
            <button
              onClick={() => setShowContext(!showContext)}
              className="flex items-center gap-1 text-xs transition-opacity hover:opacity-70"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <motion.span
                animate={{ rotate: showContext ? 90 : 0 }}
                transition={{ duration: 0.15 }}
              >
                <ChevronRight size={12} />
              </motion.span>
              <span>Full context</span>
            </button>
            
            <AnimatePresence>
              {showContext && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p 
                    className="mt-3 text-sm leading-relaxed pl-3 border-l-2"
                    style={{ 
                      color: 'var(--text-secondary)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    {paragraph.text}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Suggested questions */}
        {chatHistory.length === 0 && !isAsking && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-8 flex flex-wrap gap-2"
          >
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => {
                  setQuestion(q);
                  inputRef.current?.focus();
                }}
                className="px-3 py-2 text-sm rounded-lg transition-all hover:opacity-80"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                }}
              >
                {q}
              </button>
            ))}
          </motion.div>
        )}

        {/* Chat history */}
        {chatHistory.length > 0 && (
          <div className="space-y-4 mb-8">
            {chatHistory.map((item, idx) => (
              <div key={idx} className="space-y-3">
                <ChatBubble role="user" content={item.q} />
                <ChatBubble role="assistant" content={item.a} />
              </div>
            ))}
          </div>
        )}

        {/* Current response */}
        {(isAsking || response) && chatHistory.length === 0 && (
          <div className="space-y-3 mb-8">
            <ChatBubble role="user" content={pendingQuestion} />
            <ChatBubble 
              role="assistant" 
              content={response || ''} 
              isLoading={isAsking} 
              isStreaming={!!response}
            />
          </div>
        )}

        {/* Input */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="sticky bottom-6"
        >
          <div 
            className="flex gap-2 rounded-lg overflow-hidden shadow-sm"
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
              className="flex-1 px-4 py-3 bg-transparent outline-none text-sm"
              style={{ color: 'var(--text-primary)' }}
              disabled={isAsking}
            />
            <button
              onClick={handleAsk}
              disabled={isAsking || !question.trim()}
              className="px-4 py-3 text-sm text-white transition-all hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <Send size={16} />
            </button>
          </div>
        </motion.div>
      </div>

      <Toast message={toast.message} isVisible={toast.visible} onHide={hideToast} />
    </motion.div>
  );
}
