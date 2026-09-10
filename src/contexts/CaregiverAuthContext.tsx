import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { getProvider } from '../services/data/factory';
import { getSupabaseClient } from '../services/supabase/client';
import type { CaregiverSession, DataProvider } from '../services/data/types';

export interface CaregiverAuthState {
  loading: boolean;
  caregiver: CaregiverSession | null;
  emailSentTo: string | null;
  error: string | null;
  sendMagicLink: (email: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<CaregiverAuthState | null>(null);

const LS_LAST_EMAIL = 'smriti-caregiver-email';

export function CaregiverAuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [caregiver, setCaregiver] = useState<CaregiverSession | null>(null);
  const [emailSentTo, setEmailSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const providerRef = useRef<DataProvider | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const resolveSession = useCallback(async () => {
    try {
      const provider = getProvider();
      providerRef.current = provider;
      const session = await provider.getCaregiverSession();
      if (mountedRef.current) {
        setCaregiver(session);
        setError(null);
      }
    } catch (e) {
      if (mountedRef.current) {
        setCaregiver(null);
        setError(e instanceof Error ? e.message : 'Could not load caregiver session.');
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void resolveSession();
  }, [resolveSession]);

  const sendMagicLink = useCallback(async (email: string) => {
    const clean = email.trim();
    if (!clean) return { ok: false, error: 'Please enter an email address.' };
    try {
      window.localStorage.setItem(LS_LAST_EMAIL, clean);
    } catch {
      /* ignore */
    }
    const client = getSupabaseClient();
    if (!client) {
      if (mountedRef.current) {
        setEmailSentTo(clean);
        setError(null);
      }
      return { ok: true };
    }
    const { error: otpError } = await client.auth.signInWithOtp({
      email: clean,
      options: { emailRedirectTo: window.location.origin + '/caregiver' },
    });
    if (otpError) {
      if (mountedRef.current) setError(otpError.message);
      return { ok: false, error: otpError.message };
    }
    if (mountedRef.current) {
      setEmailSentTo(clean);
      setError(null);
    }
    return { ok: true };
  }, []);

  const signOut = useCallback(async () => {
    const client = getSupabaseClient();
    try {
      await client?.auth.signOut();
    } catch {
      /* ignore */
    }
    try {
      window.localStorage.removeItem(LS_LAST_EMAIL);
    } catch {
      /* ignore */
    }
    if (mountedRef.current) {
      setCaregiver(null);
      setEmailSentTo(null);
      setError(null);
    }
  }, []);

  const value = useMemo<CaregiverAuthState>(
    () => ({ loading, caregiver, emailSentTo, error, sendMagicLink, signOut }),
    [loading, caregiver, emailSentTo, error, sendMagicLink, signOut],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCaregiverAuth(): CaregiverAuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useCaregiverAuth must be used inside CaregiverAuthProvider');
  return v;
}

/** Last email the caregiver typed — prefilled on the auth form for convenience. */
export function lastCaregiverEmail(): string {
  try {
    return window.localStorage.getItem(LS_LAST_EMAIL) ?? '';
  } catch {
    return '';
  }
}
