import { useState } from 'react';
import { Activity, CalendarCheck2, Droplets, Pill, Users, Brain } from 'lucide-react';
import type { CaregiverSummary } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import ProgressBar from '../ui/ProgressBar';
import Card from '../ui/Card';

const tiles = [
  { key: 'caregiver.patients', icon: Users },
  { key: 'caregiver.medicinesToday', icon: Pill },
  { key: 'caregiver.hydration', icon: Droplets },
  { key: 'caregiver.appointments', icon: CalendarCheck2 },
  { key: 'caregiver.activity', icon: Activity },
  { key: 'caregiver.cognitive', icon: Brain },
] as const;

export default function SummaryTiles({ summary }: { summary: CaregiverSummary }) {
  const { t } = useLanguage();
  const values = [
    `${summary.totalPatients}`,
    `${summary.medicinesToday.done}/${summary.medicinesToday.total}`,
    `${summary.hydrationAvg}%`,
    `${summary.appointmentsToday}`,
    `${summary.activeStreakDays} ${t('caregiver.streak')}`,
    '68%',
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {tiles.map((tile, i) => {
        const Icon = tile.icon;
        return (
          <Card key={tile.key} className="!p-4">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-pine-800 text-white">
              <Icon size={22} aria-hidden />
            </span>
            <p className="mt-2 font-display text-[24px] font-semibold leading-none text-pine-950">
              {values[i]}
            </p>
            <p className="mt-1 text-[14px] font-extrabold text-ink-600">{t(tile.key)}</p>
            {i === 2 && (
              <div className="mt-2">
                <ProgressBar value={summary.hydrationAvg} />
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

export function ChecklistCard() {
  const { t } = useLanguage();
  const [items, setItems] = useState([
    { id: 'c1', label: 'Morning medicine — Malati Devi', done: true },
    { id: 'c2', label: '4 glasses of water before noon', done: true },
    { id: 'c3', label: 'Confirm 10:30 AM hospital visit', done: false },
    { id: 'c4', label: 'Evening memory tablet reminder', done: false },
  ]);

  return (
    <Card>
      <h3 className="font-display text-[22px] font-semibold text-pine-950">{t('caregiver.checklist')}</h3>
      <ul className="mt-3 space-y-2.5">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setItems((list) => list.map((x) => (x.id === item.id ? { ...x, done: !x.done } : x)))}
              aria-pressed={item.done}
              className={`flex min-h-[3.5rem] w-full items-center gap-3 rounded-2xl border-2 px-4 text-left text-[16px] font-extrabold transition ${
                item.done
                  ? 'border-leaf-500/30 bg-leaf-50 text-leaf-700'
                  : 'border-line bg-white text-ink-900 hover:border-pine-600'
              }`}
            >
              <span
                aria-hidden
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 ${
                  item.done ? 'border-leaf-600 bg-leaf-600 text-white' : 'border-ink-500/40 bg-white'
                }`}
              >
                {item.done ? '✓' : ''}
              </span>
              <span className={item.done ? 'line-through opacity-80' : ''}>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
