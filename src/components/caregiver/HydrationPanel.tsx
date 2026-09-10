import { useState } from 'react';
import Button from '../../components/ui/Button';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePatientData } from '../../contexts/PatientDataContext';
import { Field, SectionCard, inputClass } from './cgShared';

/** Caregiver hydration management — target + today's progress, shared with Patient Home. */
export default function HydrationPanel() {
  const { t } = useLanguage();
  const { hydration, setHydrationTarget } = usePatientData();
  const [target, setTarget] = useState(String(hydration.targetGlasses));
  const [saved, setSaved] = useState(false);

  const apply = () => {
    const n = parseInt(target, 10);
    if (Number.isNaN(n) || n < 1 || n > 20) return;
    setHydrationTarget(n);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const pct = Math.min(100, Math.round((hydration.currentGlasses / Math.max(1, hydration.targetGlasses)) * 100));

  return (
    <SectionCard title={t('cg.hydration')}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <p className="text-[15px] font-extrabold uppercase tracking-[0.08em] text-ink-500">{t('cg.todayProgress')}</p>
          <p className="mt-1 font-display text-[44px] font-semibold leading-none text-pine-950">
            {hydration.currentGlasses}
            <span className="text-[26px] text-ink-500"> / {hydration.targetGlasses}</span>
          </p>
          <div className="mt-3 h-4 w-full overflow-hidden rounded-full bg-mist" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-sky-700 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-[15px] font-bold text-ink-600">
            {pct >= 100 ? t('cg.goalReached') : `${pct}% ${t('cg.ofGoal')}`}
          </p>
        </div>
        <div className="rounded-2xl border-[1.5px] border-line bg-cream-50 p-4">
          <Field label={t('cg.dailyTarget')}>
            <input type="number" min={1} max={20} className={inputClass} value={target} onChange={(e) => setTarget(e.target.value)} />
          </Field>
          <Button size="md" className="mt-3 w-full" onClick={apply}>
            {t('cg.updateTarget')}
          </Button>
          {saved && <p className="mt-2 text-[15px] font-extrabold text-pine-800" role="status">{t('cg.savedFeedback')}</p>}
          <p className="mt-2 text-[14px] font-bold text-ink-500">{t('cg.targetHint')}</p>
        </div>
      </div>
    </SectionCard>
  );
}
