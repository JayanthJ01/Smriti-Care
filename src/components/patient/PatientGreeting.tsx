import { Heart, Settings, Sun, User } from 'lucide-react';
import type { Patient } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { greetingKey } from '../../utils/helpers';

interface Props {
  patient: Patient;
  medicineDone: number;
  medicineTotal: number;
  waterPct: number;
}

export default function PatientGreeting({ patient }: Props) {
  const { t, lang } = useLanguage();
  const name = lang === 'as' ? patient.nameAssamese : patient.name;

  return (
    <section className="flex flex-wrap items-center justify-between gap-3" aria-label={t('patient.today')}>
      <div className="flex min-w-0 items-center gap-4">
        <span className="relative grid h-[76px] w-[76px] shrink-0 place-items-center overflow-hidden rounded-full border-[3px] border-pine-100 bg-gradient-to-b from-peach-100 to-mint-100 font-display text-[22px] font-bold text-pine-900 shadow-card">
          {patient.avatarInitials}
          <span className="absolute bottom-1 right-1 grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-coral-500 text-white">
            <Heart size={14} aria-hidden fill="currentColor" />
          </span>
        </span>
        <div className="min-w-0">
          <p className="text-[19px] font-extrabold leading-tight text-pine-900">{t(greetingKey())}</p>
          <h1 className="flex flex-wrap items-center gap-2 font-display text-[36px] font-semibold leading-none text-ink-900 sm:text-[42px]">
            {name}
            <Heart size={22} aria-hidden className="text-coral-500" fill="currentColor" />
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-[17px] font-bold text-ink-500">
            <Sun size={16} aria-hidden className="text-marigold-500" />
            Sunday, September 6
          </p>
        </div>
      </div>

      <div className="flex items-start gap-5">
        <span className="flex flex-col items-center gap-1 text-[15px] font-extrabold text-pine-900">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-pine-800 text-white shadow-card">
            <User size={30} aria-hidden />
          </span>
          Profile
        </span>
        <span className="flex flex-col items-center gap-1 text-[15px] font-extrabold text-pine-900">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-pine-100 text-pine-900 shadow-card">
            <Settings size={30} aria-hidden />
          </span>
          Settings
        </span>
      </div>
    </section>
  );
}
