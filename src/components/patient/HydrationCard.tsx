import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import type { Hydration } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatGlasses } from '../../utils/helpers';
import Button from '../ui/Button';
import Card from '../ui/Card';

export default function HydrationCard({
  hydration,
  onDrink,
}: {
  hydration: Hydration;
  onDrink: () => void;
}) {
  const { t } = useLanguage();
  const pct = formatGlasses(hydration.currentGlasses, hydration.targetGlasses);
  const complete = hydration.currentGlasses >= hydration.targetGlasses;

  return (
    <Card tone="sky" className="!p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="flex items-center gap-2 font-display text-[24px] font-semibold text-pine-950">
          <span className="text-sky-600 text-[26px]" aria-hidden>
            💧
          </span>
          {t('patient.hydration')}
        </h3>
        {complete && (
          <span className="smriti-eyebrow border-sky-600/25 bg-mint-100 text-pine-800">
            <CheckCircle2 size={15} aria-hidden /> {t('patient.goalComplete')}
          </span>
        )}
      </div>

      <div className="mt-1 flex items-center gap-4">
        <motion.span
          key={hydration.currentGlasses}
          initial={{ scale: 0.92, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid h-[92px] w-[64px] shrink-0 place-items-center rounded-2xl bg-gradient-to-b from-sky-100 to-sky-200 text-[52px]"
          aria-hidden
        >
          🧍
        </motion.span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-[30px] font-semibold leading-none text-pine-950">
            {hydration.currentGlasses} / {hydration.targetGlasses}
          </p>
          <p className="text-[16px] font-bold text-ink-600">{t('patient.glasses')}</p>
          <div className="mt-2 flex items-center gap-1" aria-hidden>
            {Array.from({ length: hydration.targetGlasses }).map((_, i) => (
              <motion.span
                key={i}
                initial={false}
                animate={{ opacity: i < hydration.currentGlasses ? 1 : 0.35 }}
                className={`h-9 w-5 rounded-md border text-center text-[16px] leading-8 ${
                  i < hydration.currentGlasses
                    ? 'border-sky-600/40 bg-gradient-to-t from-sky-600 to-sky-500 text-white'
                    : 'border-sky-600/25 bg-white text-sky-600/40'
                }`}
              >
                {i < hydration.currentGlasses ? '▮' : '▯'}
              </motion.span>
            ))}
          </div>
        </div>
      </div>

      <div
        className="mt-3 h-2.5 overflow-hidden rounded-full bg-white"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t('patient.hydration')}
      >
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-sky-600 to-sky-500"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {!complete && hydration.lastTakenAt && (
        <p className="mt-2 text-[14px] font-bold text-ink-500">
          {t('patient.lastDrink')}: {hydration.lastTakenAt}
        </p>
      )}

      {complete ? (
        <div className="mt-3 rounded-2xl bg-mint-100 p-3 text-center">
          <p className="text-[18px] font-black text-pine-900">🎉 {t('patient.goalComplete')}</p>
          <p className="text-[15px] font-bold text-ink-600">{t('patient.goalCompleteSub')}</p>
        </div>
      ) : (
        <Button
          size="lg"
          onClick={onDrink}
          className="mt-3 w-full !rounded-full bg-pine-800 text-[20px] hover:bg-pine-900"
          ariaLive="polite"
        >
          <span aria-hidden>💧</span>
          {t('patient.drinkWater')}
        </Button>
      )}
    </Card>
  );
}
