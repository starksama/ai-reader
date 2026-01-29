'use client';

export function LoadingSkeleton() {
  return (
    <div className="reader-container animate-pulse">
      {/* Title skeleton */}
      <div className="mb-8">
        <div 
          className="h-8 rounded mb-3 w-3/4"
          style={{ backgroundColor: 'var(--border)' }}
        />
        <div 
          className="h-4 rounded w-1/3"
          style={{ backgroundColor: 'var(--border)' }}
        />
      </div>

      {/* Stats skeleton */}
      <div 
        className="h-12 rounded-lg mb-8"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      />

      {/* Paragraph skeletons */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="mb-6">
          <div 
            className="h-4 rounded mb-2 w-full"
            style={{ backgroundColor: 'var(--border)' }}
          />
          <div 
            className="h-4 rounded mb-2 w-full"
            style={{ backgroundColor: 'var(--border)' }}
          />
          <div 
            className="h-4 rounded w-2/3"
            style={{ backgroundColor: 'var(--border)' }}
          />
        </div>
      ))}
    </div>
  );
}
