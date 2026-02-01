import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

export interface DbSession {
  id: string;
  user_id: string;
  title: string;
  source_url: string | null;
  source_type: 'url' | 'paste' | 'pdf' | 'file';
  created_at: string;
  updated_at: string;
}

export interface DbMessage {
  id: string;
  session_id: string;
  parent_id: string | null;
  role: 'user' | 'assistant' | 'system';
  content: string;
  paragraph_index: number | null;
  paragraph_text: string | null;
  selected_text: string | null;
  created_at: string;
}

export interface DbNote {
  id: string;
  session_id: string;
  paragraph_index: number;
  paragraph_text: string | null;
  question: string;
  answer: string;
  created_at: string;
}

interface SessionState {
  sessions: DbSession[];
  currentSession: DbSession | null;
  messages: DbMessage[];
  isLoading: boolean;
  
  // Session actions
  fetchSessions: () => Promise<void>;
  createSession: (title: string, sourceUrl: string | null, sourceType: DbSession['source_type']) => Promise<DbSession | null>;
  setCurrentSession: (session: DbSession | null) => void;
  deleteSession: (sessionId: string) => Promise<void>;
  
  // Message actions
  fetchMessages: (sessionId: string) => Promise<void>;
  addMessage: (message: Omit<DbMessage, 'id' | 'created_at'>) => Promise<DbMessage | null>;
  
  // Note actions
  saveNote: (note: Omit<DbNote, 'id' | 'created_at'>) => Promise<void>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessions: [],
  currentSession: null,
  messages: [],
  isLoading: false,

  fetchSessions: async () => {
    set({ isLoading: true });
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching sessions:', error);
      set({ isLoading: false });
      return;
    }
    
    set({ sessions: data || [], isLoading: false });
  },

  createSession: async (title, sourceUrl, sourceType) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('Not authenticated');
      return null;
    }
    
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        title,
        source_url: sourceUrl,
        source_type: sourceType,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating session:', error);
      return null;
    }
    
    set(state => ({ 
      sessions: [data, ...state.sessions],
      currentSession: data,
    }));
    
    return data;
  },

  setCurrentSession: (session) => {
    set({ currentSession: session, messages: [] });
    if (session) {
      get().fetchMessages(session.id);
    }
  },

  deleteSession: async (sessionId) => {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId);
    
    if (error) {
      console.error('Error deleting session:', error);
      return;
    }
    
    set(state => ({
      sessions: state.sessions.filter(s => s.id !== sessionId),
      currentSession: state.currentSession?.id === sessionId ? null : state.currentSession,
    }));
  },

  fetchMessages: async (sessionId) => {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }
    
    set({ messages: data || [] });
  },

  addMessage: async (message) => {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('messages')
      .insert(message)
      .select()
      .single();
    
    if (error) {
      console.error('Error adding message:', error);
      return null;
    }
    
    set(state => ({ messages: [...state.messages, data] }));
    return data;
  },

  saveNote: async (note) => {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('notes')
      .insert(note);
    
    if (error) {
      console.error('Error saving note:', error);
    }
  },
}));
