'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, X, Trash2, Clock, FileText, Link, File, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useSessionStore, DbSession } from '@/stores/session-store';

interface HistorySidebarProps {
  onSelectSession?: (session: DbSession) => void;
}

export function HistorySidebar({ onSelectSession }: HistorySidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isInitialized } = useAuthStore();
  const { sessions, isLoading, fetchSessions, deleteSession } = useSessionStore();

  useEffect(() => {
    if (user && isOpen) {
      fetchSessions();
    }
  }, [user, isOpen, fetchSessions]);

  if (!isInitialized || !user) {
    return null;
  }

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'url': return <Link size={12} />;
      case 'pdf': return <FileText size={12} />;
      default: return <File size={12} />;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
        style={{ 
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
        }}
      >
        <History size={14} style={{ color: 'var(--text-secondary)' }} />
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          History
        </span>
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] z-50 shadow-xl overflow-hidden flex flex-col"
              style={{ backgroundColor: 'var(--bg-primary)' }}
            >
              {/* Header */}
              <div 
                className="flex items-center justify-between px-4 py-3 border-b"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-2">
                  <History size={18} style={{ color: 'var(--text-primary)' }} />
                  <h2 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    Reading History
                  </h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded transition-all hover:bg-black/5"
                >
                  <X size={18} style={{ color: 'var(--text-secondary)' }} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 size={24} className="animate-spin" style={{ color: 'var(--text-tertiary)' }} />
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="px-4 py-12 text-center">
                    <Clock size={32} className="mx-auto mb-3" style={{ color: 'var(--text-tertiary)' }} />
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      No reading sessions yet
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                      Start reading to save your history
                    </p>
                  </div>
                ) : (
                  <div className="py-2">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className="group px-4 py-3 border-b transition-all hover:bg-black/5 cursor-pointer"
                        style={{ borderColor: 'var(--border)' }}
                        onClick={() => {
                          onSelectSession?.(session);
                          setIsOpen(false);
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span style={{ color: 'var(--text-tertiary)' }}>
                                {getSourceIcon(session.source_type)}
                              </span>
                              <h3 
                                className="text-sm font-medium truncate"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {session.title}
                              </h3>
                            </div>
                            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                              {formatDate(session.updated_at)}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Delete this session?')) {
                                deleteSession(session.id);
                              }
                            }}
                            className="p-1 rounded opacity-0 group-hover:opacity-100 transition-all hover:bg-red-100"
                          >
                            <Trash2 size={14} className="text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
