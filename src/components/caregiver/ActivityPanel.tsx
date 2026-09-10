import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePatientData } from '../../contexts/PatientDataContext';
import type { ActivityItem } from '../../types';
import { EmptyState, SectionCard } from './cgShared';
import { cx } from '../../utils/helpers';

const KIND_ICON: Record<ActivityItem['kind'], string> = {
  medicine: '💊',
  water: '💧',
  game: '🎮',
  appointment: '📅',
  checkin: '🌿',
};

type Filter = 'all' | ActivityItem['kind'];

const FILTERS: { id: Filter; key: string }[] = [
  { id: 'all', key: 'cg.filterAll' },
  { id: 'medicine', key: 'cg.filterMedicine' },
  { id: 'water', key: 'cg.filterHydration' },
  { id: 'appointment', key: 'cg.filterAppointments' },
  { id: 'game', key: 'cg.filterCognitive' },
];

/** Real activity timeline — newest first, filterable, straight from PatientDataContext. */
export default function ActivityPanel() {
  const { t } = useLanguage();
  const { activities } = usePatientData();
  const [filter, setFilter] = useState<Filter>('all');

  const shown = filter === 'all' ? activities : activities.filter((a) => a.kind === filter);

  return (
    <SectionCard title={t('cg.activityTitle')}>
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label={t('cg.activityTitle')}>
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
            className={cx(
              'min-h-[2.75rem] rounded-full border-[1.5px] px-4 text-[14px] font-extrabold transition',
              filter === f.id ? 'border-pine-700 bg-pine-700 text-white' : 'border-line bg-white text-ink-700',
            )}
          >
            {t(f.key)}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <EmptyState icon="🌿" text={t('cg.noActivity')} />
      ) : (
        <ol className="relative space-y-2.5 border-l-[1.5px] border-line pl-5">
          {shown.slice(0, 40).map((a) => (
            <motion.li
              key={a.id}
              layout
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="relative rounded-2xl border-[1.5px] border-line bg-cream-50 px-4 py-3"
            >
              <span
                className="absolute -left-[38px] top-4 grid h-9 w-9 place-items-center rounded-full border-[1.5px] border-line bg-white text-[17px] shadow-card"
                aria-hidden
              >
                {KIND_ICON[a.kind]}
              </span>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-[16px] font-extrabold text-ink-800">{a.titleKey ? t(a.titleKey) : a.title}</p>
                <span className="text-[13px] font-bold text-ink-500">{a.time}</span>
              </div>
              {a.detail && <p className="mt-0.5 text-[14px] font-bold text-ink-600">{a.detail}</p>}
            </motion.li>
          ))}
        </ol>
      )}
    </SectionCard>
  );
}
