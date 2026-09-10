import { useLanguage } from '../../contexts/LanguageContext';
import type { CaregiverSection } from './CaregiverPage';
import type { Patient } from '../../types';

const SECTION_TITLES: Record<CaregiverSection, string> = {
  dashboard: 'caregiver.nav.dashboard',
  family: 'caregiver.nav.family',
  appointments: 'caregiver.nav.appointments',
  activity: 'caregiver.nav.activity',
  cognitive: 'caregiver.nav.cognitive',
  preview: 'caregiver.nav.preview',
};

export default function CaregiverHeader({ patient, section }: { patient: Patient; section: CaregiverSection }) {
  const { t } = useLanguage();
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="smriti-eyebrow border-line bg-cream-50 text-pine-800">{patient.name}</p>
        <h1 className="mt-1 font-display text-[28px] font-semibold leading-tight text-pine-950 sm:text-[32px]">
          {t(SECTION_TITLES[section])}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <span className="grid h-11 w-11 place-items-center rounded-full border-[1.5px] border-line bg-cream-50 text-[16px] font-extrabold text-pine-800 shadow-card" aria-hidden>
          {patient.avatarInitials}
        </span>
        <div className="text-right">
          <p className="text-[15px] font-extrabold text-ink-700">{patient.name}</p>
          <p className="text-[13px] font-bold text-ink-500">{t('caregiver.agePrefix')}: {patient.age}</p>
        </div>
      </div>
    </div>
  );
}
