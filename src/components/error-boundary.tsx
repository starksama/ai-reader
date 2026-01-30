'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div 
          className="min-h-[200px] flex flex-col items-center justify-center p-8 text-center"
          style={{ backgroundColor: 'var(--bg-primary)' }}
        >
          <AlertTriangle 
            size={24} 
            className="mb-3" 
            style={{ color: 'var(--text-secondary)' }} 
          />
          <h3 
            className="text-sm font-medium mb-1"
            style={{ color: 'var(--text-primary)' }}
          >
            Something went wrong
          </h3>
          <p 
            className="text-xs mb-4"
            style={{ color: 'var(--text-secondary)' }}
          >
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: undefined });
              window.location.reload();
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-opacity hover:opacity-80"
            style={{
              backgroundColor: 'var(--accent)',
              color: '#fff',
            }}
          >
            <RefreshCw size={14} />
            <span>Reload</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
