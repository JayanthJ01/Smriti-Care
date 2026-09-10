import { useLanguage } from '../../../contexts/LanguageContext';
import { usePatientData } from '../../../contexts/PatientDataContext';
import type { Patient } from '../../../types';
import type { CaregiverSection } from '../CaregiverPage';
import Card from '../../../components/ui/Card';
import { cx } from '../../../utils/helpers';

interface StatTile {
  key: string;
  value: string;
  tone: 'pine' | 'sky' | 'peach' | 'mint' | 'lav' | 'sun';
}

const TONE_CLASSES: Record<StatTile['tone'], string> = {
  pine: 'smriti-card-pine text-white',
  sky: 'smriti-card-sky',
  peach: 'smriti-card-peach',
  mint: 'smriti-card-mint',
  lav: 'smriti-card-lav',
  sun: 'smriti-card-sun',
};

export default function CaregiverDashboard({ patient, onNavigate }: { patient: Patient; onNavigate: (s: CaregiverSection) => void }) {
  const { t } = useLanguage();
  const { medicines, hydration, appointments, activities, gameResults } = usePatientData();

  const completedMeds = medicines.filter((m) => m.status === 'completed').length;
  const upcomingAppts = appointments.filter((a) => a.status === 'upcoming' || a.status === 'today').length;
  const cognitiveSessions = gameResults.length;

  const tiles: StatTile[] = [
    { key: 'caregiver.stat.medicines', value: `${completedMeds} / ${medicines.length}`, tone: 'pine' },
    { key: 'caregiver.stat.hydration', value: `${hydration.currentGlasses} / ${hydration.targetGlasses}`, tone: 'sky' },
    { key: 'caregiver.stat.appointments', value: String(upcomingAppts), tone: 'peach' },
    { key: 'caregiver.stat.activity', value: String(activities.length), tone: 'mint' },
    { key: 'caregiver.stat.cognitive', value: String(cognitiveSessions), tone: 'lav' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {tiles.map((tile) => (
          <div key={tile.key} className={cx('rounded-3xl border-[1.5px] p-4 shadow-soft', TONE_CLASSES[tile.tone])}>
            <p className="text-[13px] font-extrabold uppercase tracking-[0.12em] opacity-80">{t(tile.key)}</p>
            <p className="mt-1 font-display text-[28px] font-semibold leading-tight">{tile.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card tone="cream" className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[20px] font-semibold text-pine-950">{t('caregiver.todayChecklist')}</h2>
            <button type="button" onClick={() => onNavigate('activity')} className="text-[14px] font-extrabold text-pine-800 underline decoration-2 underline-offset-4">
              {t('caregiver.viewAll')} →
            </button>
          </div>
          <ul className="mt-3 space-y-2">
            <CheckItem label={t('patient.medicine')} done={completedMeds > 0} />
            <CheckItem label={t('patient.hydration')} done={hydration.currentGlasses > 0} />
            <CheckItem label={t('patient.appointment')} done={upcomingAppts > 0} />
            <CheckItem label={t('patient.play')} done={cognitiveSessions > 0} />
          </ul>
        </Card>

        <Card tone="cream" className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[20px] font-semibold text-pine-950">{t('caregiver.recentActivity')}</h2>
            <button type="button" onClick={() => onNavigate('activity')} className="text-[14px] font-extrabold text-pine-800 underline decoration-2 underline-offset-4">
              {t('caregiver.viewAll')} →
            </button>
          </div>
          {activities.length === 0 ? (
            <p className="mt-3 text-[15px] font-bold text-ink-500">{t('caregiver.empty.activity')}</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {activities.slice(0, 4).map((a) => (
                <li key={a.id} className="flex items-center gap-3 rounded-2xl border border-line bg-white px-3 py-2">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-mint-50 text-[16px]" aria-hidden>
                    {a.kind === 'medicine' ? '💊' : a.kind === 'water' ? '💧' : a.kind === 'appointment' ? '📅' : a.kind === 'game' ? '🧩' : '✅'}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-extrabold text-ink-700">{a.title}</p>
                    <p className="text-[12px] font-bold text-ink-500">{a.timestamp}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card tone="lav" className="p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[20px] font-semibold text-pine-950">{t('caregiver.cognitiveProgress')}</h2>
          <button type="button" onClick={() => onNavigate('cognitive')} className="text-[14px] font-extrabold text-pine-800 underline decoration-2 underline-offset-4">
            {t('caregiver.viewAll')} →
          </button>
        </div>
        {gameResults.length === 0 ? (
          <p className="mt-3 text-[15px] font-bold text-ink-500">{t('caregiver.empty.cognitive')}</p>
        ) : (
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {gameResults.slice(0, 5).map((r) => (
              <div key={r.sessionId} className="rounded-2xl border border-line bg-white p-3">
                <p className="text-[14px] font-extrabold text-ink-700">{r.gameCategory}</p>
                <p className="text-[13px] font-bold text-ink-500">{r.score} pts • {r.accuracy}%</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function CheckItem({ label, done }: { label: string; done: boolean }) {
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-line bg-white px-3 py-2">
      <span className={cx('grid h-8 w-8 shrink-0 place-items-center rounded-full text-[14px] font-extrabold', done ? 'bg-mint-50 text-pine-800' : 'bg-cream-100 text-ink-500')} aria-hidden>
        {done ? '✓' : '○'}
      </span>
      <span className={cx('text-[15px] font-extrabold', done ? 'text-pine-900' : 'text-ink-600')}>{label}</span>
    </li>
  );
}
