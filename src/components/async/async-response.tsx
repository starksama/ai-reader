'use client';

import { useEffect, useState } from 'react';

interface AsyncResponseProps {
  isLoading: boolean;
  response: string | null;
}

export function AsyncResponse({ isLoading, response }: AsyncResponseProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  // Simulate streaming effect
  useEffect(() => {
    if (!response) {
      setDisplayedText('');
      return;
    }

    setIsStreaming(true);
    setDisplayedText('');
    
    const words = response.split(' ');
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < words.length) {
        setDisplayedText(prev => prev + (currentIndex > 0 ? ' ' : '') + words[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsStreaming(false);
      }
    }, 30); // 30ms per word

    return () => clearInterval(interval);
  }, [response]);

  if (isLoading) {
    return (
      <div 
        className="p-4 rounded-lg"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        <div className="flex items-center gap-2">
          <ThinkingDots />
          <span style={{ color: 'var(--text-secondary)' }}>Thinking...</span>
        </div>
      </div>
    );
  }

  if (!response && !displayedText) {
    return null;
  }

  return (
    <div 
      className="p-4 rounded-lg"
      style={{ backgroundColor: 'var(--bg-secondary)' }}
    >
      <div 
        className="prose prose-sm max-w-none whitespace-pre-wrap"
        style={{ color: 'var(--text-primary)' }}
      >
        {displayedText}
        {isStreaming && <span className="animate-pulse">▊</span>}
      </div>
    </div>
  );
}

function ThinkingDots() {
  return (
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full animate-bounce"
          style={{
            backgroundColor: 'var(--accent)',
            animationDelay: `${i * 150}ms`,
          }}
        />
      ))}
    </div>
  );
}
