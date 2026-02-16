'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSession, signIn, signOut, signUp, onAuthStateChange } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const currentSession = await getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // Sync initial session to cookies
        if (currentSession) {
          document.cookie = `sb-auth-token=${currentSession.access_token}; path=/; max-age=${currentSession.expires_in}; SameSite=Lax; secure`;
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);

      // Sync session to cookies for middleware
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (newSession) {
          document.cookie = `sb-auth-token=${newSession.access_token}; path=/; max-age=${newSession.expires_in}; SameSite=Lax; secure`;
        }
      } else if (event === 'SIGNED_OUT') {
        document.cookie = `sb-auth-token=; path=/; max-age=0; SameSite=Lax; secure`;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    try {
      await signIn(email, password);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const handleSignUp = async (email: string, password: string, fullName?: string) => {
    try {
      await signUp(email, password, fullName);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      setSession(null);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
