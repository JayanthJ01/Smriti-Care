import { Eye, Pill, Droplets, CalendarDays, Activity as ActivityIcon, Brain } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { usePatientData } from '../../../contexts/PatientDataContext';
import type { Patient } from '../../../types';
import Card from '../../../components/ui/Card';
import { formatGlasses } from '../../../utils/helpers';

/**
 * Patient App Preview — read-only view of what the patient sees.
 * No new route; internal caregiver section.
 */
export default function PatientAppPreview({ patient }: { patient: Patient }) {
  const { t, lang } = useLanguage();
  const { medicines, hydration, appointments, activities, gameResults } = usePatientData();

  const patientName = lang === 'as' ? patient.nameAssamese : patient.name;
  const completedMeds = medicines.filter((m) => m.status === 'completed').length;
  const nextAppt = appointments.find((a) => a.status === 'today' || a.status === 'upcoming');
  const waterPct = formatGlasses(hydration.currentGlasses, hydration.targetGlasses);

  return (
    <div className="space-y-4">
      <Card tone="cream" className="p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-[20px] shadow-card" aria-hidden>
            <Eye className="text-pine-700" size={22} />
          </span>
          <div>
            <h2 className="font-display text-[20px] font-semibold text-pine-950">{t('caregiver.nav.preview')}</h2>
            <p className="text-[14px] font-bold text-ink-500">{t('caregiver.previewSub')}</p>
          </div>
        </div>
      </Card>

      {/* Greeting preview */}
      <Card className="p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-mint-50 text-[20px] font-extrabold text-pine-800 shadow-card" aria-hidden>
            {patient.avatarInitials}
          </span>
          <div>
            <p className="text-[13px] font-extrabold uppercase tracking-wider text-ink-500">{t('caregiver.goodMorning')}</p>
            <h3 className="font-display text-[22px] font-semibold text-pine-950">{patientName}</h3>
            <p className="text-[13px] font-bold text-ink-500">
              {lang === 'as' ? patient.greetingNoteAssamese : patient.greetingNote}
            </p>
          </div>
        </div>
      </Card>

      {/* Medicine + Hydration row */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Card tone="peach" className="p-4">
          <div className="flex items-center gap-2">
            <Pill size={18} className="text-peach-600" aria-hidden />
            <h4 className="font-display text-[16px] font-semibold text-pine-950">{t('patient.medicine')}</h4>
          </div>
          <p className="mt-2 font-display text-[28px] font-semibold text-pine-950">
            {completedMeds} / {medicines.length}
          </p>
          <p className="text-[13px] font-bold text-ink-500">{t('caregiver.medicinesDoneToday')}</p>
          {medicines[0] && (
            <p className="mt-1 text-[13px] font-bold text-ink-600">
              {medicines[0].name} • {medicines[0].time}
            </p>
          )}
        </Card>

        <Card tone="sky" className="p-4">
          <div className="flex items-center gap-2">
            <Droplets size={18} className="text-sky-600" aria-hidden />
            <h4 className="font-display text-[16px] font-semibold text-pine-950">{t('patient.hydration')}</h4>
          </div>
          <p className="mt-2 font-display text-[28px] font-semibold text-pine-950">
            {hydration.currentGlasses} / {hydration.targetGlasses}
          </p>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/60">
            <div
              className="h-full rounded-full bg-sky-500 transition-all"
              style={{ width: `${waterPct}%` }}
            />
          </div>
        </Card>
      </div>

      {/* Next appointment */}
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <CalendarDays size={18} className="text-lav-600" aria-hidden />
          <h4 className="font-display text-[16px] font-semibold text-pine-950">{t('patient.appointment')}</h4>
        </div>
        {nextAppt ? (
          <div className="mt-2">
            <p className="text-[15px] font-extrabold text-ink-700">{nextAppt.doctorName}</p>
            <p className="text-[13px] font-bold text-ink-500">{nextAppt.specialty}</p>
            <p className="text-[13px] font-bold text-ink-500">{nextAppt.date} • {nextAppt.time}</p>
          </div>
        ) : (
          <p className="mt-2 text-[14px] font-bold text-ink-500">{t('caregiver.empty.appointments')}</p>
        )}
      </Card>

      {/* Cognitive + Activity row */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Card tone="lav" className="p-4">
          <div className="flex items-center gap-2">
            <Brain size={18} className="text-lav-700" aria-hidden />
            <h4 className="font-display text-[16px] font-semibold text-pine-950">{t('patient.play')}</h4>
          </div>
          <p className="mt-2 font-display text-[28px] font-semibold text-pine-950">{gameResults.length}</p>
          <p className="text-[13px] font-bold text-ink-500">{t('caregiver.sessionsToday')}</p>
        </Card>

        <Card tone="mint" className="p-4">
          <div className="flex items-center gap-2">
            <ActivityIcon size={18} className="text-mint-600" aria-hidden />
            <h4 className="font-display text-[16px] font-semibold text-pine-950">{t('caregiver.nav.activity')}</h4>
          </div>
          <p className="mt-2 font-display text-[28px] font-semibold text-pine-950">{activities.length}</p>
          <p className="text-[13px] font-bold text-ink-500">{t('caregiver.eventsToday')}</p>
        </Card>
      </div>
    </div>
  );
}
