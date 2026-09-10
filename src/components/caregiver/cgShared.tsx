import type { ReactNode } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { cx } from '../../utils/helpers';

/** Small status tag — text + color, never color alone. */
export function Tag({ label, tone = 'mint' }: { label: string; tone?: 'mint' | 'sky' | 'sun' | 'coral' | 'lav' | 'mist' }) {
  const tones: Record<string, string> = {
    mint: 'bg-mint-100 text-pine-900 border-pine-700/20',
    sky: 'bg-sky-100 text-sky-700 border-sky-700/20',
    sun: 'bg-sun-100 text-ink-700 border-sun-200',
    coral: 'bg-coral-50 text-coral-600 border-coral-500/25',
    lav: 'bg-lav-100 text-lav-700 border-lav-700/20',
    mist: 'bg-mist text-ink-600 border-line',
  };
  return (
    <span className={cx('inline-flex items-center rounded-full border px-3 py-0.5 text-[12px] font-extrabold uppercase tracking-[0.08em]', tones[tone])}>
      {label}
    </span>
  );
}

export function SectionCard({ title, action, children, className }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cx('rounded-3xl border-[1.5px] border-line bg-white p-5 shadow-soft sm:p-6', className)}>
      <header className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-display text-[20px] font-semibold text-pine-950 sm:text-[22px]">{title}</h3>
        {action}
      </header>
      {children}
    </section>
  );
}

export function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="grid place-items-center rounded-2xl border-[1.5px] border-dashed border-line bg-cream-50 px-4 py-8 text-center">
      <span className="text-[34px]" aria-hidden>
        {icon}
      </span>
      <p className="mt-2 text-[16px] font-bold text-ink-500">{text}</p>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-[14px] font-extrabold uppercase tracking-[0.08em] text-ink-600">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

export const inputClass =
  'w-full rounded-2xl border-[1.5px] border-line bg-white px-4 py-3 text-[17px] font-bold text-ink-800 outline-none transition focus:border-pine-700/50 focus:ring-4 focus:ring-pine-700/15';

export function usePatientName(): (p: { name: string; nameAssamese: string }) => string {
  const { lang } = useLanguage();
  return (p) => (lang === 'as' ? p.nameAssamese : p.name);
}
