import { useLanguage } from '../../contexts/LanguageContext';
import { useCaregiver } from '../../contexts/CaregiverContext';
import {
  LayoutDashboard,
  Users,
  CalendarCheck2,
  Activity,
  Brain,
  Monitor,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import { cx } from '../../utils/helpers';

export type CaregiverSection =
  | 'dashboard'
  | 'family'
  | 'appointments'
  | 'activity'
  | 'cognitive'
  | 'patientApp';

const NAV_ITEMS: { key: CaregiverSection; labelKey: string; icon: LucideIcon }[] = [
  { key: 'dashboard', labelKey: 'caregiver.nav.dashboard', icon: LayoutDashboard },
  { key: 'family', labelKey: 'caregiver.nav.family', icon: Users },
  { key: 'appointments', labelKey: 'caregiver.nav.appointments', icon: CalendarCheck2 },
  { key: 'activity', labelKey: 'caregiver.nav.activity', icon: Activity },
  { key: 'cognitive', labelKey: 'caregiver.nav.cognitive', icon: Brain },
  { key: 'patientApp', labelKey: 'caregiver.nav.patientApp', icon: Monitor },
];

export default function NavRail({
  active,
  onNavigate,
  onSignOut,
}: {
  active: CaregiverSection;
  onNavigate: (s: CaregiverSection) => void;
  onSignOut: () => void;
}) {
  const { t } = useLanguage();
  const { selectedPatient } = useCaregiver();
  const { lang } = useLanguage();
  const patientName = lang === 'as' ? selectedPatient.nameAssamese : selectedPatient.name;

  return (
    <aside className="flex h-full flex-col rounded-3xl border-[1.5px] border-line bg-white p-3 shadow-soft">
      <div className="flex items-center gap-3 px-2 py-2">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-pine-800 font-black text-white">
          {selectedPatient.avatarInitials}
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-[15px] font-semibold text-pine-950">{patientName}</p>
          <p className="truncate text-[12px] font-bold text-ink-500">{selectedPatient.village}</p>
        </div>
      </div>

      <nav className="mt-2 flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onNavigate(item.key)}
              aria-current={isActive ? 'page' : undefined}
              className={cx(
                'flex items-center gap-3 rounded-2xl px-3 py-3 text-[15px] font-extrabold transition',
                isActive
                  ? 'bg-pine-800 text-white shadow-card'
                  : 'text-ink-700 hover:bg-cream-100',
              )}
            >
              <Icon size={20} aria-hidden />
              <span className="truncate">{t(item.labelKey)}</span>
            </button>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={onSignOut}
        className="mt-2 flex items-center gap-3 rounded-2xl px-3 py-3 text-[15px] font-extrabold text-coral-600 transition hover:bg-coral-50"
      >
        <LogOut size={20} aria-hidden />
        {t('caregiver.signOut')}
      </button>
    </aside>
  );
}
