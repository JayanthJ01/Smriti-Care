import { useState } from 'react';
import { CalendarDays, Plus, Pencil, Trash2, X, Check, RotateCcw } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { usePatientData } from '../../../contexts/PatientDataContext';
import type { Patient, Appointment, AppointmentStatus } from '../../../types';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { cx } from '../../../utils/helpers';

type FormState = Omit<Appointment, 'id'>;

const EMPTY_FORM: FormState = {
  doctorName: '',
  specialty: '',
  date: '',
  time: '',
  location: '',
  note: '',
  status: 'upcoming',
};

const STATUS_OPTIONS: AppointmentStatus[] = ['upcoming', 'today', 'completed', 'cancelled'];

const STATUS_TONE: Record<AppointmentStatus, string> = {
  upcoming: 'bg-sky-500',
  today: 'bg-peach-500',
  completed: 'bg-pine-700',
  cancelled: 'bg-ink-400',
};

/**
 * AppointmentsSection — full CRUD over the shared appointment state.
 * Patient Home reads the same data, so changes here appear there immediately.
 */
export default function AppointmentsSection({ patient }: { patient: Patient }) {
  const { t } = useLanguage();
  const { appointments, addAppointment, updateAppointment, removeAppointment } = usePatientData();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const sorted = [...appointments].sort((a, b) => {
    const da = `${a.date}T${a.time}`;
    const db = `${b.date}T${b.time}`;
    return da.localeCompare(db);
  });

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    setShowForm(true);
  };

  const openEdit = (appt: Appointment) => {
    setEditingId(appt.id);
    setForm({ doctorName: appt.doctorName, specialty: appt.specialty, date: appt.date, time: appt.time, location: appt.location, note: appt.note, status: appt.status });
    setError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setError(null);
  };

  const handleSave = () => {
    if (!form.doctorName.trim() || !form.date || !form.time) {
      setError(t('caregiver.error.required'));
      return;
    }
    if (editingId) {
      updateAppointment(editingId, form);
    } else {
      addAppointment(form);
    }
    closeForm();
  };

  const handleRemove = (id: string) => removeAppointment(id);
  const handleCancel = (id: string) => updateAppointment(id, { status: 'cancelled' });
  const handleRestore = (id: string) => updateAppointment(id, { status: 'upcoming' });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[22px] font-semibold text-pine-950">{t('caregiver.appointmentsTitle')}</h2>
        <Button size="sm" onClick={openAdd}><Plus size={16} aria-hidden /> {t('caregiver.addAppointment')}</Button>
      </div>

      {showForm && (
        <Card tone="cream" className="p-5">
          <h3 className="font-display text-[18px] font-semibold text-pine-950">
            {editingId ? t('caregiver.editAppointment') : t('caregiver.addAppointment')}
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label={t('caregiver.appointmentDoctor')} value={form.doctorName} onChange={(v) => setForm({ ...form, doctorName: v })} placeholder="Dr. Sharma" />
            <Field label={t('caregiver.appointmentSpecialty')} value={form.specialty} onChange={(v) => setForm({ ...form, specialty: v })} placeholder="General" />
            <Field label={t('caregiver.appointmentDate')} value={form.date} onChange={(v) => setForm({ ...form, date: v })} type="date" />
            <Field label={t('caregiver.appointmentTime')} value={form.time} onChange={(v) => setForm({ ...form, time: v })} type="time" />
            <Field label={t('caregiver.appointmentLocation')} value={form.location} onChange={(v) => setForm({ ...form, location: v })} placeholder="City Hospital" />
            <Field label={t('caregiver.appointmentNote')} value={form.note} onChange={(v) => setForm({ ...form, note: v })} placeholder="Optional" />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <label className="text-[14px] font-bold text-ink-600">{t('caregiver.appointmentStatus')}:</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as AppointmentStatus })} className="rounded-xl border-[1.5px] border-line bg-white px-3 py-2 text-[14px] font-bold text-ink-700 outline-none focus:border-pine-700">
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{t(`caregiver.status.${s}`)}</option>)}
            </select>
          </div>
          {error && <p className="mt-2 text-[14px] font-bold text-coral-600" role="alert">{error}</p>}
          <div className="mt-4 flex gap-2">
            <Button size="sm" onClick={handleSave}><Check size={16} aria-hidden /> {t('caregiver.saveChanges')}</Button>
            <Button variant="ghost" size="sm" onClick={closeForm}><X size={16} aria-hidden /> {t('caregiver.cancel')}</Button>
          </div>
        </Card>
      )}

      {sorted.length === 0 ? (
        <Card className="p-8 text-center">
          <CalendarDays className="mx-auto h-10 w-10 text-ink-400" aria-hidden />
          <p className="mt-2 text-[16px] font-bold text-ink-500">{t('caregiver.empty.appointments')}</p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {sorted.map((a) => (
            <Card key={a.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${STATUS_TONE[a.status]}`} aria-hidden />
                    <h3 className="truncate font-display text-[17px] font-semibold text-pine-950">{a.doctorName}</h3>
                  </div>
                  {a.specialty && <p className="text-[13px] font-bold text-ink-500">{a.specialty}</p>}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button onClick={() => openEdit(a)} aria-label={t('caregiver.editAppointment')} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-ink-600 hover:border-pine-700/40 hover:text-pine-900"><Pencil size={16} /></button>
                  {a.status === 'cancelled' ? (
                    <button onClick={() => handleRestore(a.id)} aria-label={t('caregiver.restore')} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-ink-600 hover:border-pine-700/40 hover:text-pine-900"><RotateCcw size={16} /></button>
                  ) : (
                    <>
                      <button onClick={() => handleCancel(a.id)} aria-label={t('caregiver.cancel')} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-ink-600 hover:border-pine-700/40 hover:text-pine-900"><X size={16} /></button>
                      <button onClick={() => handleRemove(a.id)} aria-label={t('caregiver.delete')} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-coral-600 hover:border-coral-500/40"><Trash2 size={16} /></button>
                    </>
                  )}
                </div>
              </div>
              <p className="mt-2 text-[14px] font-bold text-ink-600">📅 {a.date} • ⏰ {a.time}</p>
              {a.location && <p className="text-[13px] font-bold text-ink-500">📍 {a.location}</p>}
              {a.note && <p className="text-[13px] font-bold text-ink-500">📝 {a.note}</p>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[13px] font-bold text-ink-600">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="rounded-xl border-[1.5px] border-line bg-white px-3 py-2.5 text-[15px] font-bold text-ink-700 shadow-card outline-none focus:border-pine-700" />
    </label>
  );
}
