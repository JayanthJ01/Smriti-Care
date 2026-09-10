import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { demoActivities } from '../../data/demoData';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ProgressBar from '../../components/ui/ProgressBar';
import StatusBadge from '../../components/ui/StatusBadge';

export default function RecentPanel() {
  const { t, lang } = useLanguage();
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? demoActivities : demoActivities.slice(0, 2);
  return (
    <Card>
      <div className="flex items-center justify-between">
        <h3 className="font-display text-[22px] font-semibold text-pine-950">{t('caregiver.recent')}</h3>
        <Button
          variant="ghost"
          className="!min-h-[2.9rem] !px-4 !text-[15px]"
          onClick={() => setShowAll((v) => !v)}
          ariaExpanded={showAll}
          ariaLive="polite"
        >
          {showAll ? t('nav.back') : t('caregiver.viewAll')}
        </Button>
      </div>
      <ul className="mt-3 space-y-2.5">
        {visible.map((a) => (
          <li key={a.id} className="flex items-center justify-between gap-3 rounded-2xl border border-line/80 bg-cream-50 p-3">
            <span className="text-[16px] font-extrabold text-ink-900">
              {lang === 'as' ? a.titleAssamese : a.title}
              <span className="block text-[14px] font-bold text-ink-500">{a.time}</span>
            </span>
            <StatusBadge tone="completed" label={t('patient.completed')} />
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <ProgressBar value={68} label={t('caregiver.cognitive')} />
      </div>
    </Card>
  );
}
