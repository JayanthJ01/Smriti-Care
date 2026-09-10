/**
 * Data provider factory for Smriti Care.
 *
 * Important:
 * - Do NOT put Supabase calls anywhere in UI, game, medicine, hydration,
 *   appointment, or activity components.
 * - Contexts should ask this factory for a provider and treat it as an
 *   abstract persistence layer.
 * - The active provider is chosen once at app startup from the existing
 *   `VITE_DATA_PROVIDER` configuration and must not change afterward.
 *
 * Supported providers:
 *   'demo'     — local/demo persistence (default, no Supabase required)
 *   'supabase' — authenticated Supabase-backed persistence (Phase 5B+)
 *
 * When Supabase mode is selected but the Supabase client is not configured
 * (missing env vars), the app should gracefully fall back to demo behavior
 * rather than crashing.
 */
import { getSupabaseClient } from '../supabase/client';
import { DemoDataProvider } from './demo/DemoDataProvider';
import { SupabaseDataProvider } from './supabase/SupabaseDataProvider';
import type { DataProvider } from './types';
import { appConfig } from '../../app/config';

let provider: DataProvider | null = null;
let committed: boolean = false;

/**
 * Returns the current data provider.
 * Safe to call from `useEffect`/initialization code after app startup.
 * Throws if called before being initialized by `setProvider`.
 */
export function getProvider(): DataProvider {
  if (!provider) {
    throw new Error('SmritiCareDataProvider: not initialized. Call setProvider() first.');
  }
  return provider;
}

/**
 * Sets the active data provider.
 * Must be called exactly once at app startup by the root layout.
 *
 * Mode selection:
 *   VITE_DATA_PROVIDER=demo     → DemoDataProvider
 *   VITE_DATA_PROVIDER=supabase → SupabaseDataProvider if Supabase is configured,
 *                                 otherwise falls back to DemoDataProvider plus a warning.
 */
export function setProvider(): void {
  if (committed) {
    console.warn('SmritiCareDataProvider: setProvider() already called; ignoring duplicate.');
    return;
  }
  committed = true;

  const mode = appConfig.dataProvider;

  if (mode === 'supabase') {
    const client = getSupabaseClient();
    if (!client) {
      // Supabase mode requested but credentials are missing.
      // Fall back to demo instead of crashing the app.
      console.warn(
        'SmritiCareDataProvider: VITE_DATA_PROVIDER=supabase is set but Supabase config is missing.',
      );
      provider = new DemoDataProvider();
      return;
    }
    provider = new SupabaseDataProvider(client);
  } else {
    provider = new DemoDataProvider();
  }
}
