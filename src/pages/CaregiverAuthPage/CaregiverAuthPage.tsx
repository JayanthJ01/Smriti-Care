import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartHandshake, PhoneCall, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { demoPatients } from '../../data/demoData';
import AppShell from '../../components/shared/AppShell';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { CalmPage } from '../../utils/motion';

export default function CaregiverAuthPage() {
  const { t, lang } = useLanguage();
  const nav = useNavigate();
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');

  return (
    <AppShell showBack backTo="/welcome">
      <CalmPage>
        <div className="smriti-shell grid gap-5 py-6 lg:grid-cols-[1fr_1fr] lg:py-8">
          <div>
            <span className="smriti-eyebrow border-pine-600/25 bg-pine-50 text-pine-800">
              <ShieldCheck size={15} aria-hidden /> {t('auth.caregiver.eyebrow')}
            </span>
            <h1 className="smriti-h-display mt-3 text-balance text-[34px] text-pine-950 sm:text-[42px]">
              {t('auth.caregiver.title')}
            </h1>
            <p className="mt-2 max-w-[52ch] text-[18px] font-semibold text-ink-600">
              {t('auth.caregiver.subtitle')}
            </p>

            <Card className="mt-4">
              <label className="block text-[17px] font-extrabold" htmlFor="cg-phone">
                {t('auth.caregiver.phoneLabel')}
              </label>
              <input
                id="cg-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('auth.caregiver.phonePlaceholder')}
                inputMode="tel"
                autoComplete="tel"
                className="smriti-input mt-2"
              />
              <label className="mt-4 block text-[17px] font-extrabold" htmlFor="cg-pin">
                {t('auth.caregiver.pinLabel')}
              </label>
              <input
                id="cg-pin"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="••••"
                inputMode="numeric"
                className="smriti-input mt-2 tracking-[0.5em]"
              />
              <div className="mt-4 grid gap-3">
                <Button size="lg" onClick={() => nav('/caregiver')}>
                  {t('auth.caregiver.primary')}
                </Button>
                <Button variant="ghost" onClick={() => nav('/caregiver')}>
                  {t('auth.caregiver.secondary')}
                </Button>
              </div>
              <p className="mt-3 text-[15px] font-bold text-ink-500">{t('auth.caregiver.note')}</p>
            </Card>
          </div>

          <div className="space-y-4">
            <Card tone="cream">
              <h2 className="font-display text-[24px] font-semibold text-pine-950">
                {t('auth.caregiver.patientsTitle')}
              </h2>
              <ul className="mt-3 space-y-2.5">
                {demoPatients.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3"
                  >
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-pine-800 font-black text-white">
                      {p.avatarInitials}
                    </span>
                    <span className="flex-1">
                      <span className="block text-[18px] font-black text-ink-900">
                        {lang === 'as' ? p.nameAssamese : p.name}, {p.age}
                      </span>
                      <span className="block text-[14px] font-bold text-ink-500">
                        {lang === 'as' ? p.villageAssamese : p.village}
                      </span>
                    </span>
                    <PhoneCall size={20} className="text-pine-700" aria-hidden />
                  </li>
                ))}
              </ul>
            </Card>

            <section className="smriti-card-pine p-6">
              <h2 className="inline-flex items-center gap-2 font-display text-[24px] font-semibold text-white">
                <HeartHandshake size={24} aria-hidden /> {t('auth.caregiver.reminderTitle')}
              </h2>
              <p className="mt-2 text-[17px] font-semibold text-white/85">{t('auth.caregiver.reminderSub')}</p>
            </section>
          </div>
        </div>
      </CalmPage>
    </AppShell>
  );
}
