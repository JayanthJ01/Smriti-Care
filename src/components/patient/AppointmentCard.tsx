import { useState } from 'react';
import { CalendarHeart, MapPin, Stethoscope } from 'lucide-react';
import type { Appointment } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import StatusBadge from '../ui/StatusBadge';
import Button from '../ui/Button';
import Card from '../ui/Card';

export default function AppointmentCard({
  appointment,
  compact = false,
  onView,
}: {
  appointment: Appointment;
  compact?: boolean;
  onView: (id: string) => void;
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && !isClosed(appointment)) onView(appointment.id);
  };
  const isClosed = (a: Appointment) => a.status === 'completed' || a.status === 'cancelled';
  const badgeTone = appointment.status;

  if (compact) {
    return (
      <Card className="!p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-pine-800 text-[34px]" aria-hidden>
            📅
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-[24px] font-semibold text-pine-950">{t('patient.appointmentsTitle')}</h3>
            <StatusBadge tone={badgeTone} />
          </div>
        </div>
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          className="mt-3 flex w-full items-center justify-between gap-2 rounded-2xl border-[1.5px] border-pine-100 bg-mint-50 px-4 py-3 text-left"
        >
          <span>
            <span className="block text-[15px] font-bold text-ink-600">{t('patient.nextAppointment')}</span>
            <span className="block text-[19px] font-black text-pine-950">
              {appointment.specialty} • {appointment.time}
            </span>
          </span>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-[20px] text-pine-900" aria-hidden>
            →
          </span>
        </button>
        {open && (
          <div className="mt-2 space-y-1 rounded-2xl bg-cream-100 p-3 text-[15px] font-bold text-ink-700">
            <p>
              {appointment.doctorName} — {appointment.specialty}
            </p>
            <p>
              {appointment.date} • {appointment.location}
            </p>
            <p className="font-semibold text-ink-600">{appointment.note}</p>
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card tone="pine" className="relative overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-marigold-400 text-pine-950">
            <CalendarHeart size={28} aria-hidden />
          </span>
          <div>
            <p className="text-[13px] font-extrabold uppercase tracking-[0.16em] text-marigold-200">
              {t('patient.appointment')}
            </p>
            <h3 className="font-display text-[24px] font-semibold leading-tight text-white">
              {appointment.date} • {appointment.time}
            </h3>
          </div>
        </div>
        <StatusBadge tone={badgeTone} />
      </div>

      <div className="mt-4 space-y-1.5 text-[17px] font-bold text-white/95">
        <p className="flex items-center gap-2">
          <Stethoscope size={19} aria-hidden /> {appointment.doctorName} — {appointment.specialty}
        </p>
        <p className="flex items-center gap-2 text-white/85">
          <MapPin size={19} aria-hidden /> {appointment.location}
        </p>
        {open && <p className="rounded-2xl bg-white/10 p-3 text-[16px]">{appointment.note}</p>}
      </div>

      <Button variant="amber" size="lg" onClick={toggle} className="mt-4 w-full" ariaExpanded={open}>
        {t('patient.viewAppointment')}
      </Button>
    </Card>
  );
}
