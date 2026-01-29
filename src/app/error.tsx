'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div 
          className="min-h-screen flex items-center justify-center p-6"
          style={{ backgroundColor: '#fafafa' }}
        >
          <div className="text-center max-w-md">
            <AlertTriangle 
              size={32} 
              className="mx-auto mb-4" 
              style={{ color: '#525252' }} 
            />
            <h2 
              className="text-xl font-semibold mb-2"
              style={{ color: '#171717' }}
            >
              Something went wrong
            </h2>
            <p 
              className="text-sm mb-6"
              style={{ color: '#525252' }}
            >
              An unexpected error occurred. Please try again.
            </p>
            <button
              onClick={reset}
              className="flex items-center gap-2 px-4 py-2.5 text-sm mx-auto"
              style={{
                backgroundColor: '#2563eb',
                color: '#fff',
                borderRadius: '2px',
              }}
            >
              <RefreshCw size={14} />
              <span>Try again</span>
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
