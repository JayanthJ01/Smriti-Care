import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ArrowRight, Gamepad2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePatientData } from '../../contexts/PatientDataContext';
import { cognitiveActivities } from '../../data/demoData';
import { formatGlasses } from '../../utils/helpers';
import AppShell from '../../components/shared/AppShell';
import PatientGreeting from '../../components/patient/PatientGreeting';
import MedicineCard from '../../components/patient/MedicineCard';
import HydrationCard from '../../components/patient/HydrationCard';
import AppointmentCard from '../../components/patient/AppointmentCard';
import CognitiveActivityCard from '../../components/patient/CognitiveActivityCard';
import RecentActivityList from '../../components/patient/RecentActivityList';
import GameRunner from '../../components/games/GameRunner';
import type { GameId } from '../../services/games/gameRegistry';
import { CalmPage } from '../../utils/motion';

export default function PatientPage() {
  const { t } = useLanguage();
  const {
    patient,
    medicines,
    hydration,
    activities,
    nextAppointment,
    medicinesDone,
    takeMedicine,
    remindLater,
    drinkWater,
    viewAppointment,
  } = usePatientData();
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const nextMedicine = medicines[0];
  const waterPct = formatGlasses(hydration.currentGlasses, hydration.targetGlasses);

  return (
    <AppShell>
      <CalmPage>
        <div className="smriti-shell space-y-4 py-4 lg:py-5">
          <PatientGreeting
            patient={patient}
            medicineDone={medicinesDone}
            medicineTotal={medicines.length}
            waterPct={waterPct}
          />

          {/* Reference 2: 3-column tablet composition
              left: appointments + recent | center: Let's Play! | right: hydration + medicine */}
          <div className="grid items-start gap-4 xl:grid-cols-[0.94fr_1.12fr_0.94fr] lg:grid-cols-[0.95fr_1.05fr_0.95fr] md:grid-cols-2">
            {/* LEFT */}
            <div className="flex min-w-0 flex-col gap-4">
              {nextAppointment && <AppointmentCard appointment={nextAppointment} compact onView={viewAppointment} />}
              <RecentActivityList items={activities} />
            </div>

            {/* CENTER — Let's Play! */}
            <section
              className="smriti-card-sun relative min-w-0 overflow-hidden p-5 sm:p-6"
              aria-labelledby="play-heading"
            >
              <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/60 to-transparent" />
              <div className="relative text-center">
                <p className="text-[40px] leading-none" aria-hidden>
                  🌞
                </p>
                <p className="mt-1 inline-flex items-center gap-2 rounded-full bg-pine-800 px-3 py-1 text-[12px] font-extrabold uppercase tracking-[0.16em] text-white">
                  <Gamepad2 size={14} aria-hidden /> {t('patient.play')}
                </p>
                <h2
                  id="play-heading"
                  className="mt-1 font-display text-[34px] font-semibold leading-none text-pine-950 sm:text-[38px]"
                >
                  {t('patient.playTitle')}
                </h2>
                <p className="mt-1 text-[16px] font-bold text-ink-600">{t('patient.playSub')}</p>
              </div>
              <div className="relative mt-4 grid gap-3 sm:grid-cols-3 md:grid-cols-3">
                {cognitiveActivities.map((a) => (
                  <CognitiveActivityCard
                    key={a.id}
                    activity={a}
                    variant="play"
                    onStart={() => setActiveGame(a.id as GameId)}
                  />
                ))}
              </div>
              <div className="relative mt-4 flex justify-center">
                <span className="inline-flex min-h-[3rem] items-center gap-2 rounded-full border-[1.5px] border-pine-800/20 bg-white px-5 text-[16px] font-extrabold text-pine-900">
                  🔊 {t('patient.voiceOn')} →
                </span>
              </div>
              {/* foliage hint — subtle, Assam greenery */}
              <div aria-hidden className="pointer-events-none absolute -bottom-3 left-4 text-[28px] opacity-70">
                🌿
              </div>
              <div aria-hidden className="pointer-events-none absolute -bottom-3 right-4 text-[28px] opacity-70">
                🌿
              </div>
            </section>

            {/* RIGHT */}
            <div className="flex min-w-0 flex-col gap-4 md:col-span-2 lg:col-span-1 xl:col-span-1">
              <HydrationCard hydration={hydration} onDrink={drinkWater} />
              {nextMedicine && <MedicineCard medicine={nextMedicine} onTake={takeMedicine} onRemindLater={remindLater} />}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
            <h2 className="font-display text-[22px] font-semibold text-pine-950">{t('patient.today')}</h2>
            <div className="flex items-center gap-2">
              <span className="smriti-eyebrow border-line bg-white text-ink-600">
                {t('common.today')} • {t('common.demo')}
              </span>
              <span className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-full border-[1.5px] border-pine-800/15 bg-white px-4 text-[15px] font-extrabold text-pine-900">
                {t('caregiver.viewAll')} <ArrowRight size={17} aria-hidden />
              </span>
            </div>
          </div>
        </div>

        {/* Game overlay — state-driven full-screen panel (no new routes). */}
        <AnimatePresence>
          {activeGame && <GameRunner gameId={activeGame} onExit={() => setActiveGame(null)} />}
        </AnimatePresence>
      </CalmPage>
    </AppShell>
  );
}
