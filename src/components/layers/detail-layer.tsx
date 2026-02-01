'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronUp, ChevronDown, Send, ChevronRight } from 'lucide-react';
import { ChatBubble } from '@/components/chat/chat-bubble';
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
  selectedText?: string;
  exploredParagraphs?: number[];
  allParagraphs?: Paragraph[];
  onBack: () => void;
  onNavigate?: (index: number) => void;
}

export function DetailLayer({ 
  paragraph, 
  articleUrl, 
  articleTitle, 
  selectedText, 
  exploredParagraphs = [],
  allParagraphs = [],
  onBack,
  onNavigate,
}: DetailLayerProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showContext, setShowContext] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // FIX #1-4: Use selector to subscribe to store updates directly
  // This avoids copying state and handles reactivity properly
  const thread = useNotesStore(
    useCallback(
      (state) => state.articles[articleUrl]?.threads?.[paragraph.index],
      [articleUrl, paragraph.index]
    )
  );
  // Memoize messages to avoid creating new array reference on each render
  const messages = useMemo(() => thread?.messages ?? [], [thread?.messages]);
  
  const addMessageToThread = useNotesStore((state) => state.addMessageToThread);

  const currentExploredIndex = exploredParagraphs.indexOf(paragraph.index);
  const canGoPrev = currentExploredIndex > 0;
  const canGoNext = currentExploredIndex < exploredParagraphs.length - 1 && currentExploredIndex !== -1;

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

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Build previous context (2-3 paragraphs before)
  const previousContext = useMemo(() => {
    if (allParagraphs.length === 0) return '';
    
    const startIdx = Math.max(0, paragraph.index - 3);
    return allParagraphs
      .slice(startIdx, paragraph.index)
      .map(p => p.text)
      .join('\n\n');
  }, [allParagraphs, paragraph.index]);

  const handleAsk = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const question = input.trim();
    setInput('');
    setError(null);
    
    // Add user message (creates thread if needed)
    addMessageToThread(articleUrl, articleTitle, paragraph.index, { role: 'user', content: question }, selectedText);
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: question }].map(m => ({
            role: m.role,
            content: m.content,
          })),
          context: {
            articleTitle,
            selectedText,
            paragraphText: paragraph.text,
            previousContext,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to get response');
      }

      const responseText = await response.text();
      
      // Add assistant message
      addMessageToThread(articleUrl, articleTitle, paragraph.index, { role: 'assistant', content: responseText });

      // FIX #5: Removed duplicate addNote call - thread already stores the data

    } catch (err) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, articleTitle, selectedText, paragraph, articleUrl, previousContext, addMessageToThread]);

  const handleQuickQuestion = useCallback((q: string) => {
    setInput(q);
    inputRef.current?.focus();
  }, []);

  const suggestedQuestions = [
    "Explain simply",
    "Why is this important?",
    "Give me an example",
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

        {/* Suggested questions - only show if no messages yet */}
        {messages.length === 0 && !isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-8 flex flex-wrap gap-2"
          >
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => handleQuickQuestion(q)}
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

        {/* Error display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg text-sm"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
          >
            {error}
          </motion.div>
        )}

        {/* Chat messages */}
        {messages.length > 0 && (
          <div className="space-y-4 mb-8">
            {messages.map((message) => (
              <ChatBubble 
                key={message.id}
                role={message.role} 
                content={message.content}
              />
            ))}
            {isLoading && (
              <ChatBubble 
                role="assistant" 
                content=""
                isLoading={true}
              />
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="sticky bottom-6"
        >
          <form onSubmit={handleAsk}>
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
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about this passage..."
                className="flex-1 px-4 py-3 bg-transparent outline-none text-sm"
                style={{ color: 'var(--text-primary)' }}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-4 py-3 text-sm text-white transition-all hover:opacity-90 disabled:opacity-40"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}
