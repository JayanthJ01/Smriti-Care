import { useState } from 'react';
import { Activity as ActivityIcon, Pill, Droplets, CalendarDays, Gamepad2, Filter } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { usePatientData } from '../../../contexts/PatientDataContext';
import type { Patient, ActivityType } from '../../../types';
import Card from '../../../components/ui/Card';
import { cx } from '../../../utils/helpers';

type FilterType = 'all' | ActivityType;

const FILTERS: { id: FilterType; key: string; icon: typeof ActivityIcon }[] = [
  { id: 'all', key: 'caregiver.filter.all', icon: Filter },
  { id: 'medicine_completed', key: 'caregiver.filter.medicine', icon: Pill },
  { id: 'medicine_deferred', key: 'caregiver.filter.medicine', icon: Pill },
  { id: 'hydration_logged', key: 'caregiver.filter.hydration', icon: Droplets },
  { id: 'appointment_viewed', key: 'caregiver.filter.appointment', icon: CalendarDays },
  { id: 'cognitive_game_completed', key: 'caregiver.filter.cognitive', icon: Gamepad2 },
];

const KIND_ICON: Record<string, string> = {
  medicine: '💊',
  water: '💧',
  appointment: '📅',
  game: '🧩',
  checkin: '✅',
};

export default function ActivitySection({ patient }: { patient: Patient }) {
  const { t, lang } = useLanguage();
  const { activities } = usePatientData();
  const [filter, setFilter] = useState<FilterType>('all');

  const filtered = filter === 'all'
    ? activities
    : activities.filter((a) => a.type === filter);

  const sorted = [...filtered].sort((a, b) => {
    const ta = a.timestamp ?? '';
    const tb = b.timestamp ?? '';
    return tb.localeCompare(ta);
  });

  return (
    <div className="space-y-4">
      <Card tone="cream" className="p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-[20px] shadow-card" aria-hidden>
            <ActivityIcon className="text-mint-600" size={22} />
          </span>
          <div>
            <h2 className="font-display text-[20px] font-semibold text-pine-950">{t('caregiver.nav.activity')}</h2>
            <p className="text-[14px] font-bold text-ink-500">{sorted.length} {t('caregiver.eventsCount')}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const Icon = f.icon;
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                aria-pressed={active}
                className={cx(
                  'inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-3 py-1.5 text-[13px] font-extrabold transition',
                  active
                    ? 'border-pine-700 bg-pine-700 text-white'
                    : 'border-line bg-white text-ink-600 hover:border-pine-700/40',
                )}
              >
                <Icon size={14} aria-hidden />
                {t(f.key)}
              </button>
            );
          })}
        </div>
      </Card>

      {sorted.length === 0 ? (
        <Card className="p-8 text-center">
          <ActivityIcon className="mx-auto h-12 w-12 text-ink-400" aria-hidden />
          <p className="mt-3 text-[16px] font-bold text-ink-500">{t('caregiver.empty.activity')}</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {sorted.map((a) => {
            const title = a.titleKey ? t(a.titleKey) : (lang === 'as' ? a.titleAssamese : a.title);
            return (
              <div key={a.id} className="flex items-start gap-3 rounded-2xl border-[1.5px] border-line bg-white p-3 shadow-card">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cream-100 text-[18px]" aria-hidden>
                  {KIND_ICON[a.kind] ?? '✅'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-extrabold text-ink-700">{title}</p>
                  {a.detail && <p className="text-[13px] font-bold text-ink-500">{a.detail}</p>}
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[12px] font-bold text-ink-400">{a.time}</span>
                    {a.meta?.difficulty && (
                      <span className="inline-flex rounded-full bg-lav-50 px-2 py-0.5 text-[11px] font-extrabold text-lav-700">
                        {String(a.meta.difficulty)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
