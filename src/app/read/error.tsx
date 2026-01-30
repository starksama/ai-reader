'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Read page error:', error);
  }, [error]);

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="text-center max-w-md">
        <AlertTriangle 
          size={32} 
          className="mx-auto mb-4" 
          style={{ color: 'var(--text-secondary)' }} 
        />
        <h2 
          className="text-xl font-semibold mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          Failed to load article
        </h2>
        <p 
          className="text-sm mb-6"
          style={{ color: 'var(--text-secondary)' }}
        >
          {error.message || 'Something went wrong while loading the article.'}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-md transition-opacity hover:opacity-80"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
            }}
          >
            <ArrowLeft size={14} />
            <span>Go back</span>
          </Link>
          <button
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-md transition-opacity hover:opacity-80"
            style={{
              backgroundColor: 'var(--accent)',
              color: '#fff',
            }}
          >
            <RefreshCw size={14} />
            <span>Try again</span>
          </button>
        </div>
      </div>
    </div>
  );
}
