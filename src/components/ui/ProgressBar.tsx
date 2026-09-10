import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

export default function ProgressBar({ value, label }: { value: number; label?: string }) {
  const { t } = useLanguage();
  return (
    <div>
      {label && (
        <div className="mb-2 flex items-center justify-between text-[15px] font-extrabold text-ink-700">
          <span>{label}</span>
          <span aria-live="polite">{value}%</span>
        </div>
      )}
      <div
        className="h-3.5 overflow-hidden rounded-full bg-pine-100"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? t('patient.progressTitle')}
      >
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-pine-600 via-pine-500 to-marigold-400"
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
