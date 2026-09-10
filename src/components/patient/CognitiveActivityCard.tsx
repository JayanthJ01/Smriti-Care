import { useState } from 'react';
import { Play, Info } from 'lucide-react';
import type { CognitiveActivity } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import Card from '../ui/Card';
import Button from '../ui/Button';

const cardTone = {
  memory: 'mint',
  attention: 'sky',
  routine: 'lav',
} as const;

const artBg = {
  memory: 'bg-gradient-to-b from-white to-mint-100',
  attention: 'bg-gradient-to-b from-white to-sky-100',
  routine: 'bg-gradient-to-b from-white to-lav-100',
} as const;

const playBg: Record<string, string> = {
  memory: 'bg-pine-700 hover:bg-pine-800',
  attention: 'bg-sky-600 hover:bg-sky-700',
  routine: 'bg-lav-600 hover:bg-lav-700',
};

const art = {
  memory: '🌸',
  attention: '🔍',
  routine: '🔵',
} as const;

export default function CognitiveActivityCard({
  activity,
  variant = 'default',
  onStart,
}: {
  activity: CognitiveActivity;
  variant?: 'default' | 'play';
  /** Launches this game through the GameRunner (Phase 4A). */
  onStart?: () => void;
}) {
  const { t } = useLanguage();
  const [started, setStarted] = useState(false);
  const tone = cardTone[activity.id as keyof typeof cardTone] ?? 'mint';

  if (variant === 'play') {
    return (
      <Card tone={tone} className="flex h-full flex-col items-center !p-4 text-center">
        <span
          className={`grid h-[92px] w-full place-items-center rounded-2xl border border-white/70 text-[52px] ${artBg[activity.id as keyof typeof artBg] ?? 'bg-white'}`}
          aria-hidden
        >
          {art[activity.id as keyof typeof art] ?? '🎮'}
        </span>
        <h3 className="mt-2 font-display text-[21px] font-semibold leading-tight text-pine-950">
          {t(activity.titleKey)}
        </h3>
        <button
          type="button"
          onClick={onStart}
          aria-label={`${t('patient.start')}: ${t(activity.titleKey)}`}
          className={`mt-2 grid h-14 w-14 place-items-center rounded-full text-white shadow-card transition ${playBg[activity.id] ?? 'bg-pine-700'}`}
        >
          <Play size={26} aria-hidden fill="currentColor" />
        </button>
        <span className="sr-only">{t('patient.start')}</span>
      </Card>
    );
  }

  return (
    <Card tone={tone} className="flex h-full flex-col">
      <h3 className="mt-1 font-display text-[23px] font-semibold text-pine-950">{t(activity.titleKey)}</h3>
      <p className="mt-1 flex-1 text-[16px] font-bold leading-snug text-ink-600">{t(activity.descriptionKey)}</p>
      <p className="mt-2 text-[14px] font-extrabold text-ink-500">
        ~{activity.estimatedMinutes} {t('cognitive.minutes')} • {t('common.comingPhase4')}
      </p>
      <Button
        variant={activity.accent === 'amber' ? 'amber' : 'primary'}
        onClick={() => setStarted((v) => !v)}
        className="mt-3 w-full"
        ariaLive="polite"
        ariaPressed={started}
      >
        <Play size={20} aria-hidden />
        {started ? `${t('patient.start')} ✓` : t('patient.start')}
      </Button>
      <p className="mt-2 inline-flex items-start gap-1.5 text-[13px] font-bold leading-snug text-ink-500">
        <Info size={15} aria-hidden className="mt-0.5 shrink-0" />
        {t('patient.playHint')}
      </p>
    </Card>
  );
}
