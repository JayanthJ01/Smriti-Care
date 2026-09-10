import { AlertTriangle, CheckCircle2, CircleDashed, Clock3, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { cx } from '../../utils/helpers';

type Tone =
  | 'pending'
  | 'completed'
  | 'missed'
  | 'deferred'
  | 'overdue'
  | 'upcoming'
  | 'today'
  | 'cancelled'
  | 'info';

const styles: Record<Tone, string> = {
  pending: 'bg-marigold-100 text-[#7A4A00] border border-marigold-300/60',
  completed: 'bg-leaf-100 text-leaf-700 border border-leaf-500/25',
  missed: 'bg-clay-100 text-clay-600 border border-clay-500/25',
  deferred: 'bg-white text-ink-600 border border-line',
  overdue: 'bg-clay-100 text-clay-600 border border-clay-500/25',
  upcoming: 'bg-pine-50 text-pine-800 border border-pine-600/20',
  today: 'bg-pine-800 text-white border border-pine-900',
  cancelled: 'bg-clay-50 text-clay-600 border border-clay-500/25',
  info: 'bg-white text-pine-800 border border-line',
};

const fallbackText: Record<Tone, string> = {
  pending: 'Pending',
  completed: 'Done',
  missed: 'Missed',
  deferred: 'Deferred',
  overdue: 'Due',
  upcoming: 'Upcoming',
  today: 'Today',
  cancelled: 'Cancelled',
  info: 'Info',
};

export default function StatusBadge({ tone, label }: { tone: Tone; label?: string }) {
  const { t } = useLanguage();
  const key = tone === 'today' ? 'common.today' : `patient.${tone}`;
  const translated = t(key);
  const text = label ?? (translated === key ? fallbackText[tone] : translated);
  const Icon =
    tone === 'completed'
      ? CheckCircle2
      : tone === 'missed' || tone === 'overdue'
        ? AlertTriangle
        : tone === 'cancelled'
          ? X
          : tone === 'deferred'
            ? CircleDashed
            : Clock3;
  return (
    <span className={cx('smriti-status', styles[tone])}>
      <Icon size={17} strokeWidth={2.6} aria-hidden />
      {text}
    </span>
  );
}

