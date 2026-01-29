'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';

interface AsyncResponseProps {
  isLoading: boolean;
  response: string | null;
}

export function AsyncResponse({ isLoading, response }: AsyncResponseProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [copied, setCopied] = useState(false);

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
    }, 15);

    return () => clearInterval(interval);
  }, [response]);

  const handleCopy = async () => {
    if (!response) return;
    await navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="py-4"
      >
        <div className="flex items-center gap-2">
          <motion.div
            className="w-1 h-4"
            style={{ backgroundColor: 'var(--accent)' }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Thinking
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-4 relative group"
    >
      {/* Copy button */}
      {!isStreaming && response && (
        <button
          onClick={handleCopy}
          className="absolute top-4 right-0 p-1 transition-opacity opacity-0 group-hover:opacity-100"
          style={{ color: 'var(--text-secondary)' }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </button>
      )}
      
      <div 
        className="text-sm leading-relaxed pr-8"
        style={{ color: 'var(--text-primary)' }}
      >
        {displayedText.split('\n').map((line, i) => {
          const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          
          if (line.startsWith('•') || line.startsWith('-')) {
            return (
              <p key={i} className="ml-4 my-1" dangerouslySetInnerHTML={{ __html: formattedLine }} />
            );
          }
          
          return line ? (
            <p key={i} className="my-2" dangerouslySetInnerHTML={{ __html: formattedLine }} />
          ) : (
            <br key={i} />
          );
        })}
        
        {isStreaming && (
          <motion.span 
            className="inline-block w-px h-4 ml-0.5"
            style={{ backgroundColor: 'var(--accent)' }}
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.4, repeat: Infinity }}
          />
        )}
      </div>
    </motion.div>
  );
}
