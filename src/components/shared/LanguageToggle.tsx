import { Languages } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { lang, toggle, t } = useLanguage();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t('nav.language')}
      className="inline-flex min-h-[3rem] items-center gap-2 rounded-full border-2 border-pine-800/15 bg-white/90 px-4 py-2 text-[16px] font-extrabold text-pine-900 shadow-sm transition hover:border-pine-700 hover:bg-pine-50 focus-visible:ring-4 focus-visible:ring-pine-500/30"
    >
      <Languages size={20} aria-hidden />
      {!compact && <span className="hidden sm:inline">{t('nav.language')}</span>}
      <span
        className="inline-flex items-center overflow-hidden rounded-full border border-line text-[14px]"
        aria-hidden
      >
        <span className={`px-2.5 py-1 ${lang === 'en' ? 'bg-pine-800 text-white' : 'bg-white text-ink-600'}`}>EN</span>
        <span className={`px-2.5 py-1 ${lang === 'as' ? 'bg-pine-800 text-white' : 'bg-white text-ink-600'}`}>অস</span>
      </span>
    </button>
  );
}
