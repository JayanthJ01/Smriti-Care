import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import type { Medicine } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { isPastTime, splitTimeLabel } from '../../utils/datetime';
import StatusBadge from '../ui/StatusBadge';
import Button from '../ui/Button';
import Card from '../ui/Card';

export default function MedicineCard({
  medicine,
  onTake,
  onRemindLater,
}: {
  medicine: Medicine;
  onTake: (id: string) => void;
  onRemindLater: (id: string) => void;
}) {
  const { t } = useLanguage();
  const [clockTime, clockPeriod] = splitTimeLabel(medicine.time);
  const done = medicine.status === 'completed';
  const deferred = medicine.status === 'deferred';
  const overdue = medicine.status === 'pending' && isPastTime(medicine.time);
  const badgeTone = done ? 'completed' : deferred ? 'deferred' : overdue ? 'overdue' : 'pending';

  return (
    <Card tone="peach" className="!p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-display text-[24px] font-semibold text-pine-950">
          <span aria-hidden className="text-[26px]">
            💊
          </span>
          {t('patient.medicineTitle')}
        </h3>
        <StatusBadge tone={badgeTone} />
      </div>

      <div className="mt-2 flex items-center gap-4">
        <span
          className="grid h-[92px] w-[92px] shrink-0 place-items-center rounded-full border-[3px] border-pine-800 bg-white text-[18px] font-black text-pine-950"
          aria-hidden
        >
          <span className="text-center leading-tight">
            {clockTime}
            <br />
            {clockPeriod}
          </span>
        </span>
        <div className="min-w-0">
          <p className="font-display text-[26px] font-semibold leading-none text-pine-950">{medicine.time}</p>
          <p className="mt-1 text-[16px] font-bold leading-snug text-ink-600">{medicine.name}</p>
          <p className="text-[15px] font-bold text-ink-500">{medicine.dosage}</p>
          {medicine.note && <p className="text-[14px] font-bold text-ink-500">🫖 {medicine.note}</p>}
        </div>
      </div>

      <Button
        size="lg"
        variant={done ? 'ghost' : 'coral'}
        onClick={() => onTake(medicine.id)}
        disabled={done || deferred}
        className="mt-3 w-full !rounded-full text-[19px] uppercase tracking-wide"
        ariaLive="polite"
        ariaPressed={done}
      >
        {done ? (
          <motion.span
            initial={{ scale: 0.85 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 18 }}
            className="inline-flex items-center gap-2"
          >
            <CheckCircle2 size={22} aria-hidden /> {t('patient.medicineTaken')}
          </motion.span>
        ) : (
          <span aria-hidden>💊</span>
        )}
        {!done && t('patient.takeMedicine')}
      </Button>
      <button
        type="button"
        onClick={() => onRemindLater(medicine.id)}
        disabled={done || deferred}
        aria-pressed={deferred}
        aria-live="polite"
        className="mt-2 inline-flex min-h-[3rem] w-full items-center justify-center gap-2 rounded-full border-[1.5px] border-pine-800/15 bg-white/70 px-4 text-[16px] font-extrabold text-pine-900 disabled:opacity-80"
      >
        <span aria-hidden>🕒</span>
        {deferred ? t('patient.reminderSet') : t('patient.remindLater')}
      </button>
    </Card>
  );
}
