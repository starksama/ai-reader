'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface AsyncResponseProps {
  isLoading: boolean;
  response: string | null;
  onCopy?: () => void;
}

export function AsyncResponse({ isLoading, response, onCopy }: AsyncResponseProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [copied, setCopied] = useState(false);

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
    }, 20);

    return () => clearInterval(interval);
  }, [response]);

  const handleCopy = async () => {
    if (!response) return;
    try {
      await navigator.clipboard.writeText(response);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard failed
    }
  };

  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: 'var(--accent)' }}
                animate={{ 
                  y: [0, -4, 0],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Thinking...
          </span>
        </div>
      </motion.div>
    );
  }

  if (!response && !displayedText) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl relative group"
      style={{ backgroundColor: 'var(--bg-secondary)' }}
    >
      {/* Copy button */}
      {!isStreaming && response && (
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 px-2 py-1 rounded-lg text-xs transition-all opacity-0 group-hover:opacity-100"
          style={{
            backgroundColor: 'var(--highlight)',
            color: 'var(--text-secondary)',
          }}
        >
          {copied ? '✓ Copied' : '📋 Copy'}
        </button>
      )}
      
      <div 
        className="prose prose-sm max-w-none leading-relaxed pr-12"
        style={{ color: 'var(--text-primary)' }}
      >
        {/* Format text with basic markdown support */}
        {displayedText.split('\n').map((line, i) => {
          // Bold text
          const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          
          // Bullet points
          if (line.startsWith('•') || line.startsWith('-')) {
            return (
              <p key={i} className="ml-4 my-1" dangerouslySetInnerHTML={{ __html: formattedLine }} />
            );
          }
          
          // Regular paragraph
          return line ? (
            <p key={i} className="my-2" dangerouslySetInnerHTML={{ __html: formattedLine }} />
          ) : (
            <br key={i} />
          );
        })}
        
        {isStreaming && (
          <motion.span 
            className="inline-block w-0.5 h-4 ml-0.5"
            style={{ backgroundColor: 'var(--accent)' }}
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}
      </div>
    </motion.div>
  );
}
