'use client';

import { Suspense } from 'react';
import { ReadContent } from './read-content';
import { ReaderHeader } from '@/components/reader/reader-header';

export default function ReadPage() {
  return (
    <>
      <ReaderHeader />
      <Suspense fallback={<LoadingState />}>
        <ReadContent />
      </Suspense>
    </>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse text-4xl mb-4">📖</div>
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
          Loading article...
        </p>
      </div>
    </div>
  );
}
