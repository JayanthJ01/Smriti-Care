import { CalendarHeart } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { demoAppointments, demoPatients } from '../../data/demoData';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';

export default function UpcomingPanel() {
  const { t, lang } = useLanguage();
  return (
    <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
      <Card tone="cream">
        <h3 className="inline-flex items-center gap-2 font-display text-[22px] font-semibold text-pine-950">
          <CalendarHeart size={24} aria-hidden /> {t('caregiver.upcoming')}
        </h3>
        <ul className="mt-3 space-y-2.5">
          {demoAppointments.map((a) => (
            <li key={a.id} className="rounded-2xl border border-line bg-white p-4">
              <p className="text-[18px] font-black text-ink-900">{a.doctorName} • {a.date}</p>
              <p className="text-[15px] font-bold text-ink-600">{a.time} • {a.location}</p>
              <div className="mt-2">
                <StatusBadge tone={a.status === 'today' ? 'today' : a.status === 'completed' ? 'completed' : 'upcoming'} />
              </div>
            </li>
          ))}
        </ul>
      </Card>
      <Card>
        <h3 className="font-display text-[22px] font-semibold text-pine-950">{t('caregiver.careStatus')}</h3>
        <ul className="mt-3 grid gap-2.5 sm:grid-cols-3">
          {demoPatients.map((p) => (
            <li key={p.id} className="rounded-2xl border border-line bg-cream-50 p-4 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-pine-800 font-black text-white">
                {p.avatarInitials}
              </span>
              <p className="mt-2 text-[16px] font-black text-ink-900">{lang === 'as' ? p.nameAssamese : p.name}</p>
              <div className="mt-2 flex justify-center">
                <StatusBadge tone="completed" label="Stable" />
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-3 rounded-2xl bg-pine-50 p-3 text-[15px] font-bold text-pine-900">
          12-{t('caregiver.streak')} • {t('common.assamTouch')}
        </p>
      </Card>
    </div>
  );
}
