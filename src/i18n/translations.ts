import en from './en';
import assamese from './as';
import type { SupportedLanguage } from '../types';

const dicts: Record<SupportedLanguage, Record<string, string>> = { en, as: assamese };

export function getString(lang: SupportedLanguage, key: string): string {
  return dicts[lang][key] ?? en[key] ?? key;
}

export { en, assamese };
