import type { SupportedLanguage } from '../types';

export interface AppConfig {
  phase: string;
  defaultLanguage: SupportedLanguage;
  /** Phase 3: 'demo' works without Supabase; switch to 'supabase' in Phase 5. */
  dataProvider: 'demo' | 'supabase';
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

export const appConfig: AppConfig = {
  phase: import.meta.env.VITE_APP_PHASE ?? 'phase-1-foundation',
  defaultLanguage: (import.meta.env.VITE_DEFAULT_LANGUAGE as SupportedLanguage) ?? 'en',
  dataProvider: (import.meta.env.VITE_DATA_PROVIDER as 'demo' | 'supabase' | undefined) ?? 'demo',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
};

// Phase 2+ service boundary placeholder. Do not add secrets here.
export interface CareService {
  readonly phase: string;
}

export const phase1ServiceNote =
  'Phase 1 uses local demo data only. Supabase services will be added behind this boundary later.';
