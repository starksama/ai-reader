import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  emailSent: boolean;
  error: string | null;
  
  // Actions
  initialize: () => Promise<void>;
  signInWithEmail: (email: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearEmailSent: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isInitialized: false,
  emailSent: false,
  error: null,

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

  signInWithEmail: async (email: string) => {
    set({ isLoading: true, error: null, emailSent: false });
    const supabase = createClient();
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) {
      set({ isLoading: false, error: error.message });
      return false;
    }
    
    set({ isLoading: false, emailSent: true });
    return true;
  },

  signOut: async () => {
    set({ isLoading: true });
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null, isLoading: false });
  },

  clearEmailSent: () => set({ emailSent: false }),
  clearError: () => set({ error: null }),
}));
