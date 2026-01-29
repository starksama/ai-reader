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
    }, 25); // 25ms per word for faster streaming

    return () => clearInterval(interval);
  }, [response]);

  if (isLoading) {
    return (
      <div 
        className="p-4 rounded-lg"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        <div className="flex items-center gap-3">
          <ThinkingDots />
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Thinking...
          </span>
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
        className="prose prose-sm max-w-none whitespace-pre-wrap leading-relaxed"
        style={{ color: 'var(--text-primary)' }}
      >
        {displayedText}
        {isStreaming && (
          <span 
            className="inline-block w-2 h-4 ml-0.5 animate-pulse"
            style={{ backgroundColor: 'var(--accent)' }}
          />
        )}
      </div>
    </div>
  );
}

function ThinkingDots() {
  return (
    <div className="flex gap-1.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor: 'var(--accent)',
            animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes bounce {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-4px);
          }
        }
      `}</style>
    </div>
  );
}
