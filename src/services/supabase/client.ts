import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const SUPABASE_CONFIGURED = Boolean(supabaseUrl && supabaseAnonKey);

type SupabaseClient = ReturnType<typeof createClient<Database>>;

let _client: SupabaseClient | null = null;

/**
 * Returns the singleton Supabase client, or null when env vars are missing
 * (demo mode). Never throws — callers decide how to handle demo fallback.
 */

function getClient(): SupabaseClient | null {
  if (!_client) {
    if (!SUPABASE_CONFIGURED || !supabaseUrl || !supabaseAnonKey) {
      return null;
    }
    _client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return _client;
}

/** Singleton Supabase client, or null in demo mode (env vars missing). Never throws. */

export function getSupabaseClient() {
  return getClient();
}

/** Direct client access — prefer getSupabaseClient(). */
export function supabaseClient() {
  return getClient();
}

/** Auth namespace for the singleton client, or null in demo mode. Lazily resolved so importing this module never throws. */
export function getSupabaseAuth() {
  return getClient()?.auth ?? null;
}

/** Back-compat alias used by earlier Phase 5B drafts. Kept lazy for the same reason. */
export const supabaseAuth = {
  getSession: async (...args: Parameters<NonNullable<SupabaseClient['auth']['getSession']>>) => {
    const auth = getClient()?.auth;
    if (!auth) return { data: { session: null }, error: null } as Awaited<ReturnType<NonNullable<SupabaseClient['auth']['getSession']>>>;
    return auth.getSession(...args);
  },
  onAuthStateChange: (
    ...args: Parameters<NonNullable<SupabaseClient['auth']['onAuthStateChange']>>
  ) => {
    const auth = getClient()?.auth;
    if (!auth) return { data: { subscription: { unsubscribe: () => {} } } } as unknown as ReturnType<NonNullable<SupabaseClient['auth']['onAuthStateChange']>>;
    return auth.onAuthStateChange(...args);
  },
  signInWithOtp: async (...args: Parameters<NonNullable<SupabaseClient['auth']['signInWithOtp']>>) => {
    const auth = getClient()?.auth;
    if (!auth) return { data: null, error: { message: 'Supabase is not configured (demo mode).' } } as unknown as Awaited<ReturnType<NonNullable<SupabaseClient['auth']['signInWithOtp']>>>;
    return auth.signInWithOtp(...args);
  },
  signOut: async (...args: Parameters<NonNullable<SupabaseClient['auth']['signOut']>>) => {
    const auth = getClient()?.auth;
    if (!auth) return { error: null } as Awaited<ReturnType<NonNullable<SupabaseClient['auth']['signOut']>>>;
    return auth.signOut(...args);
  },
};

/** Safe helper that never throws raw errors to the UI layer. */
export async function supabaseCall<T>(promise: Promise<{ data: T | null; error: { message?: string } | null }>): Promise<{ ok: boolean; data: T | null; error: string | null }> {
  try {
    const { data, error } = await promise;
    if (error) {
      return { ok: false, data: null, error: error.message ?? 'An error occurred.' };
    }
    return { ok: true, data: data as T, error: null };
  } catch (err: unknown) {
    const message = err && typeof err === 'object' && 'message' in err ? String((err as { message: unknown }).message) : 'A network or server error occurred.';
    return { ok: false, data: null, error: message };
  }
}
