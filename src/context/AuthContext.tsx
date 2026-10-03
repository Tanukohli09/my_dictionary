import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { AppState } from 'react-native';
import { authErrorMessage, completeAuthCallback, deleteAuthenticatedAccount, isAuthConfigured, signInWithGoogle, signOut, supabase } from '../services/auth';
import { clearLocalDataForUser, prepareLocalDataForSignOut } from '../services/wordStorage';

type AuthContextValue = {
  isConfigured: boolean;
  isLoading: boolean;
  isBusy: boolean;
  session: Session | null;
  user: User | null;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(isAuthConfigured);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    let mounted = true;
    let subscription: { unsubscribe: () => void } | undefined;
    let appStateSubscription: { remove: () => void } | undefined;

    async function initialize() {
      try {
        await completeAuthCallback();
        const { data, error: sessionError } = await supabase!.auth.getSession();
        if (sessionError) throw sessionError;
        if (mounted) setSession(data.session);
      } catch (initializationError) {
        if (mounted) setError(authErrorMessage(initializationError) || null);
      } finally {
        if (mounted) setIsLoading(false);
      }

      if (!mounted) return;
      const { data } = supabase!.auth.onAuthStateChange((_event, nextSession) => {
        if (mounted) setSession(nextSession);
      });
      subscription = data.subscription;

      appStateSubscription = AppState.addEventListener('change', (state) => {
        if (state === 'active') void supabase!.auth.startAutoRefresh();
        else void supabase!.auth.stopAutoRefresh();
      });
      void supabase!.auth.startAutoRefresh();
    }

    void initialize();
    return () => {
      mounted = false;
      subscription?.unsubscribe();
      appStateSubscription?.remove();
      void supabase!.auth.stopAutoRefresh();
    };
  }, []);

  const runSignIn = useCallback(async () => {
    setError(null);
    setIsBusy(true);
    try {
      await signInWithGoogle();
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
      }
    } catch (signInError) {
      const message = authErrorMessage(signInError);
      if (message) setError(message);
    } finally {
      setIsBusy(false);
    }
  }, []);

  const runSignOut = useCallback(async () => {
    setError(null);
    setIsBusy(true);
    try {
      if (session?.user.id) await prepareLocalDataForSignOut(session.user.id);
      await signOut();
      setSession(null);
    } catch (signOutError) {
      const message = authErrorMessage(signOutError);
      if (message) setError(message);
    } finally {
      setIsBusy(false);
    }
  }, [session]);

  const runDeleteAccount = useCallback(async () => {
    setError(null);
    setIsBusy(true);
    let serverDeletionCompleted = false;
    try {
      const userId = session?.user.id;
      if (!userId) throw new Error('AUTH_NOT_SIGNED_IN');
      await deleteAuthenticatedAccount();
      serverDeletionCompleted = true;
      try {
        await clearLocalDataForUser(userId);
      } catch {
        throw new Error('ACCOUNT_LOCAL_CLEANUP_FAILED');
      }
      await signOut('local');
      setSession(null);
    } catch (deleteError) {
      if (serverDeletionCompleted) {
        await signOut('local').catch(() => undefined);
        setSession(null);
      }
      const message = authErrorMessage(deleteError);
      if (message) setError(message);
    } finally {
      setIsBusy(false);
    }
  }, [session]);

  const value = useMemo<AuthContextValue>(() => ({
    clearError: () => setError(null),
    deleteAccount: runDeleteAccount,
    error,
    isBusy,
    isConfigured: isAuthConfigured,
    isLoading,
    session,
    signInWithGoogle: runSignIn,
    signOut: runSignOut,
    user: session?.user || null,
  }), [error, isBusy, isLoading, runSignIn, runSignOut, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
