'use client';

import { Suspense } from 'react';
import { ReadContent } from './read-content';

export default function ReadPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ReadContent />
    </Suspense>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Progress bar placeholder */}
      <div 
        className="fixed top-0 left-0 h-px w-1/3 animate-pulse"
        style={{ backgroundColor: 'var(--accent)' }}
      />
      
      <div className="reader-container pt-8">
        {/* Title skeleton */}
        <div 
          className="h-8 w-3/4 rounded mb-4 animate-pulse"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        />
        
        {/* Byline skeleton */}
        <div 
          className="h-4 w-1/2 rounded mb-8 animate-pulse"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        />
        
        {/* Paragraph skeletons */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="mb-6 space-y-2">
            <div 
              className="h-4 w-full rounded animate-pulse"
              style={{ backgroundColor: 'var(--bg-secondary)', animationDelay: `${i * 100}ms` }}
            />
            <div 
              className="h-4 w-5/6 rounded animate-pulse"
              style={{ backgroundColor: 'var(--bg-secondary)', animationDelay: `${i * 100 + 50}ms` }}
            />
            <div 
              className="h-4 w-4/6 rounded animate-pulse"
              style={{ backgroundColor: 'var(--bg-secondary)', animationDelay: `${i * 100 + 100}ms` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
