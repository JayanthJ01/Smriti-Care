import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { SupportedLanguage } from '../types';
import { getString } from '../i18n/translations';

interface LanguageCtx {
  lang: SupportedLanguage;
  setLang: (l: SupportedLanguage) => void;
  toggle: () => void;
  t: (key: string) => string;
}

const Ctx = createContext<LanguageCtx | null>(null);
const STORAGE_KEY = 'smriti-lang';

function readInitial(): SupportedLanguage {
  try {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    return saved === 'as' ? 'as' : 'en';
  } catch {
    return 'en';
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<SupportedLanguage>(readInitial);

  useEffect(() => {
    try {
      document.documentElement.lang = lang === 'as' ? 'as' : 'en';
    } catch {
      /* ignore */
    }
  }, [lang]);

  const setLang = useCallback((l: SupportedLanguage) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* shared tablets may block storage — ignore in Phase 1 */
    }
  }, []);

  const toggle = useCallback(() => setLang(lang === 'en' ? 'as' : 'en'), [lang, setLang]);
  const t = useCallback((key: string) => getString(lang, key), [lang]);
  const value = useMemo(() => ({ lang, setLang, toggle, t }), [lang, setLang, toggle, t]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLanguage(): LanguageCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useLanguage must be used inside LanguageProvider');
  return v;
}

