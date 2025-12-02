/**
 * Authentication Hook using Supabase
 */

import { useState, useEffect, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, Profile } from '../services/supabaseClient';

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export interface UseAuthReturn extends AuthState {
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateCredits: (newCredits: number) => void;
  deductCredits: (amount: number) => Promise<boolean>;
  incrementGenerations: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile from database
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data as Profile;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchProfile(session.user.id).then(setProfile);
      }

      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setProfile(profile);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // Sign up with email/password
  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setError(error.message);
    }

    return { error };
  }, []);

  // Sign in with email/password
  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    }

    return { error };
  }, []);

  // Sign in with Google
  const signInWithGoogle = useCallback(async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      setError(error.message);
    }

    return { error };
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    if (user) {
      const profile = await fetchProfile(user.id);
      setProfile(profile);
    }
  }, [user, fetchProfile]);

  // Update credits locally (optimistic update)
  const updateCredits = useCallback((newCredits: number) => {
    setProfile(prev => prev ? { ...prev, credits: newCredits } : null);
  }, []);

  // Deduct credits (with server validation)
  const deductCredits = useCallback(async (amount: number): Promise<boolean> => {
    if (!user || !profile) return false;

    if (profile.credits < amount) {
      return false;
    }

    // Optimistic update
    const newBalance = profile.credits - amount;
    setProfile(prev => prev ? { ...prev, credits: newBalance } : null);

    // Server-side deduction
    const { data, error } = await supabase.rpc('deduct_credits', {
      p_user_id: user.id,
      p_amount: amount,
      p_type: 'generation',
      p_description: 'Thumbnail generation',
    });

    if (error || !data?.[0]?.success) {
      // Revert optimistic update
      await refreshProfile();
      return false;
    }

    return true;
  }, [user, profile, refreshProfile]);

  // Increment generation count
  const incrementGenerations = useCallback(async () => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ total_generations: (profile?.total_generations || 0) + 1 })
      .eq('id', user.id);

    if (!error) {
      setProfile(prev => prev ? {
        ...prev,
        total_generations: prev.total_generations + 1
      } : null);
    }
  }, [user, profile]);

  return {
    user,
    profile,
    session,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    refreshProfile,
    updateCredits,
    deductCredits,
    incrementGenerations,
  };
}

export default useAuth;
