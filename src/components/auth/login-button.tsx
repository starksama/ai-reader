'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, LogOut, User, Mail, Loader2, Check, X } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

export function LoginButton() {
  const { 
    user, 
    isLoading, 
    isInitialized, 
    emailSent,
    error,
    initialize, 
    signInWithEmail, 
    signOut,
    clearEmailSent,
    clearError,
  } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    await signInWithEmail(email.trim());
  };

  const handleClose = () => {
    setShowMenu(false);
    setEmail('');
    clearEmailSent();
    clearError();
  };

  if (!isInitialized) {
    return (
      <div className="w-8 h-8 flex items-center justify-center">
        <Loader2 size={16} className="animate-spin" style={{ color: 'var(--text-tertiary)' }} />
      </div>
    );
  }

  if (user) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          {user.user_metadata?.avatar_url ? (
            <img 
              src={user.user_metadata.avatar_url} 
              alt="" 
              className="w-5 h-5 rounded-full"
            />
          ) : (
            <User size={14} style={{ color: 'var(--text-secondary)' }} />
          )}
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {user.user_metadata?.name || user.email?.split('@')[0] || 'User'}
          </span>
        </button>

        <AnimatePresence>
          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={handleClose}
              />
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 z-50 min-w-[160px] rounded-lg shadow-lg overflow-hidden"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                }}
              >
                <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                    {user.email}
                  </p>
                </div>
                <button
                  onClick={() => {
                    signOut();
                    handleClose();
                  }}
                  disabled={isLoading}
                  className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-all hover:bg-black/5"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <LogOut size={14} />
                  <span>Sign out</span>
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all hover:opacity-90 disabled:opacity-50"
        style={{ 
          backgroundColor: 'var(--accent)',
          color: '#fff',
        }}
      >
        {isLoading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <LogIn size={14} />
        )}
        <span>Sign in</span>
      </button>

      <AnimatePresence>
        {showMenu && !isLoading && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={handleClose}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 z-50 w-72 rounded-lg shadow-lg overflow-hidden"
              style={{ 
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              {emailSent ? (
                <div className="p-4 text-center">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: 'var(--accent)', opacity: 0.1 }}
                  >
                    <Check size={20} style={{ color: 'var(--accent)' }} />
                  </div>
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    Check your email
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    We sent a login link to<br />
                    <span style={{ color: 'var(--text-secondary)' }}>{email}</span>
                  </p>
                  <button
                    onClick={handleClose}
                    className="mt-3 text-xs hover:underline"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Mail size={14} style={{ color: 'var(--text-tertiary)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                      Sign in with email
                    </span>
                  </div>
                  
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    autoFocus
                    className="w-full px-3 py-2 rounded-md text-sm outline-none transition-all"
                    style={{ 
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  
                  {error && (
                    <p className="mt-2 text-xs flex items-center gap-1" style={{ color: '#ef4444' }}>
                      <X size={12} />
                      {error}
                    </p>
                  )}
                  
                  <button
                    type="submit"
                    disabled={!email.trim() || isLoading}
                    className="w-full mt-3 px-3 py-2 rounded-md text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ 
                      backgroundColor: 'var(--accent)',
                      color: '#fff',
                    }}
                  >
                    {isLoading ? (
                      <Loader2 size={14} className="animate-spin mx-auto" />
                    ) : (
                      'Send magic link'
                    )}
                  </button>
                  
                  <p className="mt-3 text-xs text-center" style={{ color: 'var(--text-tertiary)' }}>
                    No password needed — we'll email you a link
                  </p>
                </form>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
