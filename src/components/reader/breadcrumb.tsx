'use client';

import { Layer } from '@/stores/layer-store';

interface BreadcrumbProps {
  layers: Layer[];
  currentIndex: number;
  onNavigate: (index: number) => void;
}

export function Breadcrumb({ layers, currentIndex, onNavigate }: BreadcrumbProps) {
  const visibleLayers = layers.slice(0, currentIndex + 1);

  return (
    <nav className="breadcrumb">
      {currentIndex > 0 && (
        <button
          onClick={() => onNavigate(currentIndex - 1)}
          className="flex items-center gap-1 hover:opacity-70 transition-opacity"
          style={{ color: 'var(--accent)' }}
        >
          <span>←</span>
        </button>
      )}
      
      {visibleLayers.map((layer, index) => (
        <span key={layer.id} className="flex items-center gap-2">
          {index > 0 && <span style={{ color: 'var(--text-secondary)' }}>/</span>}
          <button
            onClick={() => onNavigate(index)}
            className={`transition-colors ${
              index === currentIndex ? 'breadcrumb-current' : 'breadcrumb-item'
            }`}
          >
            {layer.type === 'main' && 'main'}
            {layer.type === 'paragraph' && `p-${layer.paragraphIndex}`}
            {layer.type === 'reply' && `reply`}
          </button>
        </span>
      ))}
    </nav>
  );
}
