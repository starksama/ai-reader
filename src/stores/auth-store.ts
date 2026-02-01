import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    if (get().isInitialized) return;
    
    const supabase = createClient();
    
    // Get initial session
    const { data: { user } } = await supabase.auth.getUser();
    set({ user, isInitialized: true });
    
    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null });
    });
  },

  signInWithGoogle: async () => {
    set({ isLoading: true });
    const supabase = createClient();
    
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    set({ isLoading: false });
  },

  signInWithGithub: async () => {
    set({ isLoading: true });
    const supabase = createClient();
    
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    set({ isLoading: false });
  },

  signOut: async () => {
    set({ isLoading: true });
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null, isLoading: false });
  },
}));
