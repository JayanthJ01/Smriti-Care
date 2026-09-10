import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, UserRound } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import AppShell from '../../components/shared/AppShell';
import FaceVerificationPanel from '../../components/authentication/FaceVerificationPanel';
import Card from '../../components/ui/Card';
import { CalmPage } from '../../utils/motion';

export default function PatientAuthPage() {
  const { t } = useLanguage();
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const goPatient = useCallback(() => nav('/patient'), [nav]);

  return (
    <AppShell showBack backTo="/welcome">
      <CalmPage>
        <div className="smriti-shell grid gap-5 py-6 lg:grid-cols-[0.9fr_1.1fr] lg:py-8">
          <div className="space-y-4">
            <span className="smriti-eyebrow border-pine-600/25 bg-pine-50 text-pine-800">
              <UserRound size={15} aria-hidden /> {t('auth.patient.eyebrow')}
            </span>
            <h1 className="smriti-h-display text-balance text-[34px] text-pine-950 sm:text-[42px]">
              {t('auth.patient.title')}
            </h1>
            <p className="max-w-[52ch] text-[18px] font-semibold text-ink-600">{t('auth.patient.subtitle')}</p>

            <Card>
              <label className="block text-[17px] font-extrabold text-ink-900" htmlFor="patient-name">
                {t('auth.patient.nameLabel')}
              </label>
              <input
                id="patient-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('auth.patient.namePlaceholder')}
                autoComplete="name"
                className="smriti-input mt-2"
              />
              <label className="mt-4 block text-[17px] font-extrabold text-ink-900" htmlFor="patient-pin">
                {t('auth.patient.pinLabel')}
              </label>
              <input
                id="patient-pin"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••"
                inputMode="numeric"
                className="smriti-input mt-2 tracking-[0.5em]"
              />
              <p className="mt-3 inline-flex items-start gap-2 rounded-2xl bg-cream-200/70 p-3 text-[15px] font-bold text-ink-700">
                <Info size={18} aria-hidden className="mt-0.5 shrink-0" />
                {t('auth.patient.hint')}
              </p>
            </Card>
          </div>

          <FaceVerificationPanel onVerified={goPatient} />
        </div>
      </CalmPage>
    </AppShell>
  );
}
