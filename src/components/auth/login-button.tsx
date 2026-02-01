'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, LogOut, User, Github, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

export function LoginButton() {
  const { user, isLoading, isInitialized, initialize, signInWithGoogle, signInWithGithub, signOut } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

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
                onClick={() => setShowMenu(false)}
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
                    setShowMenu(false);
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
              onClick={() => setShowMenu(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 z-50 min-w-[180px] rounded-lg shadow-lg overflow-hidden"
              style={{ 
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              <button
                onClick={() => {
                  signInWithGoogle();
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2.5 text-left text-sm flex items-center gap-3 transition-all hover:bg-black/5"
                style={{ color: 'var(--text-primary)' }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
              <button
                onClick={() => {
                  signInWithGithub();
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2.5 text-left text-sm flex items-center gap-3 transition-all hover:bg-black/5"
                style={{ color: 'var(--text-primary)' }}
              >
                <Github size={16} />
                <span>Continue with GitHub</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
