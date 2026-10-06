import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeRedirectUri } from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const AUTH_SCHEME = 'mydictionary';
const AUTH_CALLBACK_PATH = 'auth/callback';
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';
const GOOGLE_AUTH_ENABLED = process.env.EXPO_PUBLIC_GOOGLE_AUTH_ENABLED === 'true';

export const isAuthConfigured = Boolean(GOOGLE_AUTH_ENABLED && SUPABASE_URL && SUPABASE_ANON_KEY);

if (Platform.OS === 'web') WebBrowser.maybeCompleteAuthSession();

const authStorage = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') return AsyncStorage.getItem(key);
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string) => {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

export const supabase: SupabaseClient | null = isAuthConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
        persistSession: true,
        storage: authStorage,
      },
    })
  : null;

export function getAuthRedirectUri() {
  return makeRedirectUri({ scheme: AUTH_SCHEME, path: AUTH_CALLBACK_PATH });
}

function callbackParams(callbackUrl: string) {
  const parsed = new URL(callbackUrl);
  const hash = parsed.hash.startsWith('#') ? parsed.hash.slice(1) : parsed.hash;
  const params = new URLSearchParams(parsed.search);
  if (hash) {
    for (const [key, value] of new URLSearchParams(hash)) params.set(key, value);
  }
  return params;
}

function clearWebCallbackUrl() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  const cleanUrl = new URL(window.location.href);
  cleanUrl.hash = '';
  for (const key of ['code', 'error', 'error_code', 'error_description', 'state']) {
    cleanUrl.searchParams.delete(key);
  }
  window.history.replaceState({}, document.title, cleanUrl.pathname + cleanUrl.search);
}

export async function completeAuthCallback(callbackUrl?: string) {
  if (!supabase) return false;
  const currentUrl = callbackUrl || (Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.href : null);
  if (!currentUrl) return false;

  try {
    const params = callbackParams(currentUrl);
    const errorDescription = params.get('error_description') || params.get('error');
    if (errorDescription) throw new Error(errorDescription);

    const code = params.get('code');
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    if (!code && !(accessToken && refreshToken)) return false;

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw error;
    } else {
      const { error } = await supabase.auth.setSession({ access_token: accessToken!, refresh_token: refreshToken! });
      if (error) throw error;
    }

    return true;
  } finally {
    if (!callbackUrl) clearWebCallbackUrl();
  }
}

export async function signInWithGoogle() {
  if (!supabase) throw new Error('AUTH_NOT_CONFIGURED');

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getAuthRedirectUri(),
      queryParams: { prompt: 'select_account' },
      skipBrowserRedirect: Platform.OS !== 'web',
    },
  });
  if (error) throw error;
  if (!data.url) throw new Error('AUTH_URL_MISSING');

  if (Platform.OS === 'web') return;

  const result = await WebBrowser.openAuthSessionAsync(data.url, getAuthRedirectUri());
  if (result.type === 'cancel' || result.type === 'dismiss') return;
  if (result.type !== 'success') throw new Error('AUTH_SESSION_UNAVAILABLE');
  await completeAuthCallback(result.url);
}

export async function signOut(scope: 'global' | 'local' = 'global') {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut({ scope });
  if (error) throw error;
}

export async function deleteAuthenticatedAccount() {
  if (!supabase) throw new Error('AUTH_NOT_CONFIGURED');
  const { data, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (!data.session) throw new Error('AUTH_NOT_SIGNED_IN');

  const { error } = await supabase.functions.invoke('delete-account', { body: {} });
  if (error) throw new Error('ACCOUNT_DELETE_FAILED');
}

export async function getCurrentAuthUserId() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id || null;
}

export function authErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (error.message === 'AUTH_NOT_CONFIGURED') return 'Google sign-in is not configured in this build yet.';
    if (error.message === 'AUTH_NOT_SIGNED_IN') return 'You must be signed in to delete your account.';
    if (error.message === 'AUTH_SESSION_UNAVAILABLE') return 'The Google sign-in session could not be completed. Please try again.';
    if (error.message === 'AUTH_URL_MISSING') return 'The authentication provider did not return a sign-in URL.';
    if (error.message === 'ACCOUNT_DELETE_FAILED') return 'We could not delete your account. Your data was not removed; please try again or contact support.';
    if (error.message === 'ACCOUNT_LOCAL_CLEANUP_FAILED') return 'Your account was deleted, but this device could not remove its local cache. Clear the app storage and contact support if the data remains visible.';
    if (error.message === 'LOCAL_DATA_PROTECTION_FAILED') return 'Your local data could not be secured before sign-out. Please try again.';
    if (/cancel|dismiss/i.test(error.message)) return '';
  }
  return 'Google sign-in could not be completed. Please try again.';
}
