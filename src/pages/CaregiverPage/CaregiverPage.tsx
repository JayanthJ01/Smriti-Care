import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Activity as ActivityIcon,
  Brain,
  Eye,
  LogOut,
  Heart,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCaregiver } from '../../contexts/CaregiverContext';
import AppShell from '../../components/shared/AppShell';
import Button from '../../components/ui/Button';
import { CalmPage } from '../../utils/motion';

import CaregiverDashboard from './sections/CaregiverDashboard';
import FamilySection from './sections/FamilySection';
import AppointmentsSection from './sections/AppointmentsSection';
import ActivitySection from './sections/ActivitySection';
import CognitiveProgressSection from './sections/CognitiveProgressSection';
import PatientAppPreview from './sections/PatientAppPreview';
import CaregiverHeader from './CaregiverHeader';

export type CaregiverSection = 'dashboard' | 'family' | 'appointments' | 'activity' | 'cognitive' | 'preview';

const NAV_ITEMS: { id: CaregiverSection; icon: typeof LayoutDashboard; key: string }[] = [
  { id: 'dashboard', icon: LayoutDashboard, key: 'caregiver.nav.dashboard' },
  { id: 'family', icon: Users, key: 'caregiver.nav.family' },
  { id: 'appointments', icon: CalendarDays, key: 'caregiver.nav.appointments' },
  { id: 'activity', icon: ActivityIcon, key: 'caregiver.nav.activity' },
  { id: 'cognitive', icon: Brain, key: 'caregiver.nav.cognitive' },
  { id: 'preview', icon: Eye, key: 'caregiver.nav.preview' },
];

export default function CaregiverPage() {
  const { t } = useLanguage();
  const { selectedPatient, signOut } = useCaregiver();
  const [section, setSection] = useState<CaregiverSection>('dashboard');

  const handleSignOut = () => {
    signOut();
  };

  const renderSection = () => {
    if (!selectedPatient) {
      return (
        <div className="flex flex-col items-center justify-center rounded-3xl border-[1.5px] border-line bg-white p-10 text-center shadow-soft">
          <Heart className="h-12 w-12 text-pine-700" aria-hidden />
          <p className="mt-3 text-lg font-bold text-ink-700">{t('caregiver.noPatients')}</p>
        </div>
      );
    }
    switch (section) {
      case 'dashboard':
        return <CaregiverDashboard patient={selectedPatient} onNavigate={setSection} />;
      case 'family':
        return <FamilySection patient={selectedPatient} />;
      case 'appointments':
        return <AppointmentsSection patient={selectedPatient} />;
      case 'activity':
        return <ActivitySection patient={selectedPatient} />;
      case 'cognitive':
        return <CognitiveProgressSection patient={selectedPatient} />;
      case 'preview':
        return <PatientAppPreview patient={selectedPatient} />;
      default:
        return null;
    }
  };

  return (
    <AppShell>
      <CalmPage className="smriti-shell flex flex-col gap-4 py-4 lg:flex-row">
        {/* Navigation rail */}
        <aside className="lg:w-64 lg:shrink-0">
          <div className="rounded-3xl border-[1.5px] border-line bg-white p-4 shadow-soft">
            <nav className="flex gap-2 overflow-x-auto lg:flex-col" aria-label={t('caregiver.nav.label')}>
              {NAV_ITEMS.map(({ id, icon: Icon, key }) => {
                const active = section === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSection(id)}
                    aria-current={active ? 'page' : undefined}
                    className={`flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-extrabold transition ${
                      active
                        ? 'bg-pine-700 text-white shadow-card'
                        : 'text-ink-600 hover:bg-cream-100 hover:text-pine-900'
                    }`}
                  >
                    <Icon size={20} aria-hidden />
                    <span>{t(key)}</span>
                  </button>
                );
              })}
            </nav>
            <hr className="my-4 border-line" />
            <Button variant="ghost" size="md" onClick={handleSignOut} className="w-full">
              <LogOut size={18} aria-hidden /> {t('caregiver.signOut')}
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          <CaregiverHeader patient={selectedPatient} section={section} />
          <AnimatePresence mode="wait">
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </div>
      </CalmPage>
    </AppShell>
  );
}

