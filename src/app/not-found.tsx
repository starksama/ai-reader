import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="text-center max-w-md">
        <p 
          className="text-6xl font-light mb-4"
          style={{ color: 'var(--text-tertiary)' }}
        >
          404
        </p>
        <h2 
          className="text-xl font-semibold mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          Page not found
        </h2>
        <p 
          className="text-sm mb-6"
          style={{ color: 'var(--text-secondary)' }}
        >
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-sm transition-opacity hover:opacity-80"
          style={{
            backgroundColor: 'var(--accent)',
            color: '#fff',
          }}
        >
          <ArrowLeft size={14} />
          <span>Go home</span>
        </Link>
      </div>
    </div>
  );
}
