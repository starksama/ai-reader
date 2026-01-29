'use client';

import { useState } from 'react';
import { AsyncResponse } from '@/components/async/async-response';

interface Paragraph {
  id: string;
  index: number;
  text: string;
  html: string;
}

interface DetailLayerProps {
  paragraph: Paragraph;
  onBack: () => void;
}

export function DetailLayer({ paragraph, onBack }: DetailLayerProps) {
  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const handleAsk = async () => {
    if (!question.trim()) return;
    
    setIsAsking(true);
    setResponse(null);
    
    // Simulate AI response with streaming
    const mockResponse = `Great question about this passage! Here's what I understand:

The text discusses "${paragraph.text.slice(0, 50)}..." which relates to the broader context of the article.

Key points:
• This paragraph establishes an important concept
• It connects to the overall narrative
• The author's intent appears to be informative

Would you like me to elaborate on any specific aspect?`;

    // Simulate streaming delay
    await new Promise(resolve => setTimeout(resolve, 500));
    setResponse(mockResponse);
    setIsAsking(false);
  };

  return (
    <div className="reader-container min-h-screen">
      {/* Back button for mobile */}
      <button
        onClick={onBack}
        className="md:hidden flex items-center gap-2 mb-4 py-2"
        style={{ color: 'var(--accent)' }}
      >
        ← Back to article
      </button>

      {/* Quoted text */}
      <div
        className="p-4 rounded-lg mb-6 border-l-4"
        style={{
          backgroundColor: 'var(--highlight)',
          borderColor: 'var(--accent)',
        }}
      >
        <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
          Selected passage:
        </p>
        <p style={{ color: 'var(--text-primary)' }}>{paragraph.text}</p>
      </div>

      {/* Ask input */}
      <div className="mb-6">
        <label 
          className="block text-sm mb-2 font-medium"
          style={{ color: 'var(--text-secondary)' }}
        >
          Ask about this passage
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            placeholder="What does this mean? Why is this important?"
            className="flex-1 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
            disabled={isAsking}
          />
          <button
            onClick={handleAsk}
            disabled={isAsking || !question.trim()}
            className="px-5 py-3 rounded-lg font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {isAsking ? '...' : 'Ask'}
          </button>
        </div>
      </div>

      {/* Response area */}
      <AsyncResponse 
        isLoading={isAsking} 
        response={response} 
      />
    </div>
  );
}
