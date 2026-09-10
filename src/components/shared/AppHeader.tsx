import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, HeartHandshake, Home } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageToggle from './LanguageToggle';

interface Props {
  showBack?: boolean;
  backTo?: string;
}

export default function AppHeader({ showBack = false, backTo = '/welcome' }: Props) {
  const { t } = useLanguage();
  const nav = useNavigate();
  const loc = useLocation();
  const onPatient = loc.pathname.startsWith('/patient');
  const onCaregiver = loc.pathname.startsWith('/caregiver');

  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-cream-50/90 backdrop-blur-md">
      <div className="gamocha-strip h-1.5 w-full" aria-hidden />
      <div className="smriti-shell flex min-h-[4.5rem] items-center justify-between gap-3 py-3">
        <div className="flex items-center gap-3">
          {showBack ? (
            <button
              type="button"
              onClick={() => nav(backTo)}
              className="inline-flex min-h-[3rem] items-center justify-center gap-2 rounded-2xl border-2 border-pine-800/15 bg-white px-4 text-[16px] font-extrabold text-pine-900 hover:bg-pine-50"
            >
              <ArrowLeft size={20} aria-hidden />
              {t('nav.back')}
            </button>
          ) : (
            <Link
              to="/welcome"
              className="flex items-center gap-3 rounded-2xl p-1 pr-3 hover:bg-white/70"
              aria-label={t('app.name')}
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-pine-800 text-white shadow-card">
                <HeartHandshake size={26} aria-hidden />
              </span>
              <span className="leading-tight">
                <span className="block font-display text-[22px] font-semibold text-pine-950">
                  {t('app.name')}
                </span>
                <span className="block text-[12px] font-extrabold uppercase tracking-[0.18em] text-ink-500">
                  {t('app.sih')} • Assam
                </span>
              </span>
            </Link>
          )}
        </div>

        <nav className="flex items-center gap-2" aria-label="Primary">
          <Link
            to="/patient"
            aria-current={onPatient ? 'page' : undefined}
            className={`hidden min-h-[3rem] items-center gap-2 rounded-full px-4 text-[16px] font-extrabold sm:inline-flex ${
              onPatient ? 'bg-pine-800 text-white' : 'bg-white text-pine-900 border-2 border-pine-800/15'
            }`}
          >
            <Home size={18} aria-hidden />
            {t('nav.patient')}
          </Link>
          <Link
            to="/caregiver"
            aria-current={onCaregiver ? 'page' : undefined}
            className={`hidden min-h-[3rem] items-center rounded-full px-4 text-[16px] font-extrabold sm:inline-flex ${
              onCaregiver ? 'bg-pine-800 text-white' : 'bg-white text-pine-900 border-2 border-pine-800/15'
            }`}
          >
            {t('nav.caregiver')}
          </Link>
          <LanguageToggle />
        </nav>
      </div>
    </header>
  );
}
