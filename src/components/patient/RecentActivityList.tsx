import { motion } from 'framer-motion';
import { Droplets, Gamepad2, Pill, Stethoscope, Sun } from 'lucide-react';
import type { ActivityItem } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import Card from '../ui/Card';

const icons = {
  medicine: Pill,
  water: Droplets,
  game: Gamepad2,
  appointment: Stethoscope,
  checkin: Sun,
};

export default function RecentActivityList({ items }: { items: ActivityItem[] }) {
  const { t, lang } = useLanguage();
  return (
    <Card className="!p-5">
      <div className="flex items-center gap-2">
        <span aria-hidden className="text-[24px]">
          ⭐
        </span>
        <h3 className="font-display text-[24px] font-semibold text-pine-950">{t('patient.recentTitle')}</h3>
      </div>
      <ul className="mt-3 space-y-2.5">
        {items.map((a) => {
          const Icon = icons[a.kind];
          const title = a.titleKey ? t(a.titleKey) : lang === 'as' ? a.titleAssamese : a.title;
          return (
            <motion.li
              key={a.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="flex items-center gap-3 rounded-2xl border-[1.5px] border-pine-100/70 bg-cream-50 px-3 py-2.5"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-mint-100 text-pine-900">
                <Icon size={21} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[17px] font-extrabold text-ink-900">{title}</span>
                <span className="block text-[14px] font-bold text-ink-500">
                  {a.time} • {a.detail}
                </span>
              </span>
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-pine-700 text-[16px] font-black text-white" aria-hidden>
                ✓
              </span>
            </motion.li>
          );
        })}
      </ul>
    </Card>
  );
}
