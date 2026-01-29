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
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="text-center">
        <p className="animate-pulse" style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    </div>
  );
}
