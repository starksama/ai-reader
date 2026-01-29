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
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse text-2xl mb-2">📖</div>
        <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    </div>
  );
}
