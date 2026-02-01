import { create } from 'zustand';
import { User, Subscription } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  emailSent: boolean;
  error: string | null;
  _subscription: Subscription | null;
  
  // Actions
  initialize: () => Promise<void>;
  signInWithEmail: (email: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearEmailSent: () => void;
  clearError: () => void;
  cleanup: () => void;
}

// Track initialization to prevent race conditions
let initializationPromise: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isInitialized: false,
  emailSent: false,
  error: null,
  _subscription: null,

  initialize: async () => {
    // Return existing promise if already initializing (prevents race condition)
    if (initializationPromise) {
      return initializationPromise;
    }
    
    // Already initialized
    if (get().isInitialized) return;
    
    initializationPromise = (async () => {
      try {
        const supabase = createClient();
        
        // Get initial session
        const { data: { user } } = await supabase.auth.getUser();
        
        // Listen for auth changes and store subscription for cleanup
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          set({ user: session?.user ?? null });
        });
        
        set({ user, isInitialized: true, _subscription: subscription });
      } finally {
        initializationPromise = null;
      }
    })();
    
    return initializationPromise;
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
  
  // Cleanup subscription to prevent memory leaks
  cleanup: () => {
    const subscription = get()._subscription;
    if (subscription) {
      subscription.unsubscribe();
      set({ _subscription: null });
    }
  },
}));
