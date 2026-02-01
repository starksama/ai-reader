'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Bot, User } from 'lucide-react';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
}

export function ChatBubble({ role, content, isLoading = false }: ChatBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = role === 'user';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-3"
      >
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
        >
          <Bot size={16} />
        </div>
        <div 
          className="flex-1 p-4 rounded-2xl rounded-tl-md"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <div className="flex items-center gap-2">
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: 'var(--accent)' }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: 'var(--accent)' }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: 'var(--accent)' }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
            />
          </div>
        </div>
      </motion.div>
    );
  }

  // Format content with basic markdown
  const formatContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Bold text
      const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // List items
      if (line.startsWith('•') || line.startsWith('-') || line.match(/^\d+\./)) {
        return (
          <p key={i} className="ml-4 my-1" dangerouslySetInnerHTML={{ __html: formattedLine }} />
        );
      }
      
      return line ? (
        <p key={i} className="my-1" dangerouslySetInnerHTML={{ __html: formattedLine }} />
      ) : (
        <br key={i} />
      );
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div 
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ 
          backgroundColor: isUser ? 'var(--bg-tertiary)' : 'var(--accent)',
          color: isUser ? 'var(--text-secondary)' : '#fff',
        }}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      {/* Bubble */}
      <div 
        className={`relative group flex-1 max-w-[85%] p-4 ${
          isUser 
            ? 'rounded-2xl rounded-tr-md' 
            : 'rounded-2xl rounded-tl-md'
        }`}
        style={{ 
          backgroundColor: isUser ? 'var(--accent)' : 'var(--bg-secondary)',
          color: isUser ? '#fff' : 'var(--text-primary)',
        }}
      >
        {/* Copy button for assistant */}
        {!isUser && (
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1.5 rounded-md transition-opacity opacity-0 group-hover:opacity-100"
            style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>
        )}

        <div className="text-sm leading-relaxed">
          {isUser ? (
            <p>{content}</p>
          ) : (
            formatContent(content)
          )}
        </div>
      </div>
    </motion.div>
  );
}
