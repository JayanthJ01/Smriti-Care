import { HeartHandshake } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function AppFooter() {
  const { t } = useLanguage();
  return (
    <footer className="mt-8 border-t border-line/70 bg-white/60">
      <div className="smriti-shell flex flex-col items-center justify-between gap-3 py-5 text-center sm:flex-row sm:text-left">
        <p className="inline-flex items-center gap-2 text-[15px] font-bold text-ink-600">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-pine-800 text-white">
            <HeartHandshake size={18} aria-hidden />
          </span>
          {t('app.name')} • {t('common.assamTouch')} • {t('app.sih')}
        </p>
        <p className="text-[14px] font-bold text-ink-500">
          {t('patient.demoNote')}
        </p>
      </div>
      <div className="gamocha-strip h-1.5 w-full opacity-80" aria-hidden />
    </footer>
  );
}
