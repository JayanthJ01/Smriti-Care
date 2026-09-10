import { useState } from 'react';
import { Droplets, Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useCaregiver } from '../../../contexts/CaregiverContext';
import type { Patient, Medicine } from '../../../types';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { cx } from '../../../utils/helpers';
interface MedFormState {
  name: string;
  dosage: string;
  time: string;
  periodLabel: string;
  note: string;
  active: boolean;
}

const EMPTY_MED_FORM: MedFormState = {
  name: '', dosage: '', time: '', periodLabel: '', note: '', active: true,
};

/**
 * FamilySection — patient selection + medicine management + hydration target.
 * All state is shared through PatientDataContext, so the Patient Home sees changes live.
 */
export default function FamilySection({ patient }: { patient: Patient }) {
  const { t } = useLanguage();
  const { patients, selectedPatientId, selectPatient, data } = useCaregiver();
  const { medicines, addMedicine, updateMedicine, removeMedicine, setHydrationTarget, hydration } = data;

  const [targetInput, setTargetInput] = useState(String(hydration.targetGlasses));
  const [targetSaved, setTargetSaved] = useState(false);

  const handleSaveTarget = () => {
    const n = parseInt(targetInput, 10);
    if (Number.isFinite(n) && n >= 1 && n <= 20) {
      setHydrationTarget(n);
      setTargetSaved(true);
      window.setTimeout(() => setTargetSaved(false), 1500);
    }
  };

  const [showMedicineForm, setShowMedicineForm] = useState(false);
  const [editingMedId, setEditingMedId] = useState<string | null>(null);
  const [medForm, setMedForm] = useState<MedFormState>(EMPTY_MED_FORM);
  const [medError, setMedError] = useState<string | null>(null);

  const openAddMedicine = () => {
    setEditingMedId(null);
    setMedForm(EMPTY_MED_FORM);
    setMedError(null);
    setShowMedicineForm(true);
  };

  const openEditMedicine = (m: Medicine) => {
    setEditingMedId(m.id);
    setMedForm({
      name: m.name,
      dosage: m.dosage,
      time: m.time,
      periodLabel: m.periodLabel,
      note: m.note ?? '',
      active: m.active !== false,
    });
    setMedError(null);
    setShowMedicineForm(true);
  };

  const closeMedicineForm = () => {
    setShowMedicineForm(false);
    setEditingMedId(null);
    setMedError(null);
  };

  const handleSaveMedicine = () => {
    if (!medForm.name.trim() || !medForm.time || !medForm.periodLabel) {
      setMedError(t('caregiver.error.required'));
      return;
    }
         const existing = editingMedId ? medicines.find((m) => m.id === editingMedId) : null;
    if (editingMedId) {
      updateMedicine(editingMedId, {
        name: medForm.name,
        dosage: medForm.dosage,
        time: medForm.time,
        periodLabel: medForm.periodLabel,
        periodLabelAssamese: medForm.periodLabel,
        status: existing?.status ?? 'pending',
        note: medForm.note || undefined,
        active: medForm.active,
      });
    } else {
      addMedicine({ name: medForm.name, dosage: medForm.dosage, time: medForm.time, periodLabel: medForm.periodLabel, periodLabelAssamese: medForm.periodLabel, note: medForm.note || undefined, active: medForm.active });
    }
    closeMedicineForm();
  };

  const toggleMedicineActive = (id: string) => {
    const m = medicines.find((med) => med.id === id);
    if (m) {
      updateMedicine(id, { active: !(m.active !== false) });
    }
  };

  return (
    <div className="space-y-4">
      <Card tone="cream" className="p-5">
        <h2 className="font-display text-[20px] font-semibold text-pine-950">{t('caregiver.selectPatient')}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {patients.map((p) => {
            const active = p.id === selectedPatientId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => selectPatient(p.id)}
                aria-pressed={active}
                className={cx(
                  'flex items-center gap-3 rounded-2xl border-[1.5px] p-4 text-left transition',
                  active
                    ? 'border-pine-700 bg-pine-700 text-white shadow-card'
                    : 'border-line bg-white text-ink-700 hover:border-pine-700/40',
                )}
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-cream-100 text-[18px] font-extrabold text-pine-800" aria-hidden>
                  {p.avatarInitials}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-display text-[18px] font-semibold">{p.name}</p>
                  <p className="text-[13px] font-bold opacity-80">{t('caregiver.agePrefix')}: {p.age}</p>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      <Card tone="sky" className="p-5">
        <div className="flex items-center gap-3">
          <Droplets className="h-8 w-8 shrink-0 text-sky-600" aria-hidden />
          <div>
            <h2 className="font-display text-[20px] font-semibold text-pine-950">{t('caregiver.hydrationGoal')}</h2>
            <p className="text-[14px] font-bold text-ink-600">
              {t('caregiver.hydrationCurrent')}: {hydration.currentGlasses} / {hydration.targetGlasses}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-end gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[12px] font-bold text-ink-600">{t('caregiver.dailyGoal')}</span>
            <input
              type="number"
              min={1}
              max={20}
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              className="w-24 rounded-xl border-[1.5px] border-line bg-white px-3 py-2 text-[15px] font-bold text-ink-700 shadow-card outline-none focus:border-pine-700"
            />
          </label>
          <Button size="sm" onClick={handleSaveTarget}>
            {t('caregiver.save')}
          </Button>
          {targetSaved && <span className="text-[13px] font-extrabold text-pine-800">{t('caregiver.saved')}</span>}
        </div>
      </Card>


      <Card tone="peach" className="p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[20px] shadow-card" aria-hidden>
              💊
            </span>
            <h2 className="font-display text-[20px] font-semibold text-pine-950">{t('caregiver.medicineManagement')}</h2>
          </div>
          <Button size="sm" onClick={openAddMedicine}>
            <Plus size={16} aria-hidden /> {t('caregiver.addMedicine')}
          </Button>
        </div>

        {showMedicineForm && (
          <Card tone="cream" className="mt-4 p-5">
            <h3 className="font-display text-[18px] font-semibold text-pine-950">
              {editingMedId ? t('caregiver.editMedicine') : t('caregiver.addMedicine')}
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <MedField label={t('caregiver.medicineName')} value={medForm.name} onChange={(v) => setMedForm({ ...medForm, name: v })} placeholder={t('caregiver.medicineName')} />
              <MedField label={t('caregiver.medicineDosage')} value={medForm.dosage} onChange={(v) => setMedForm({ ...medForm, dosage: v })} placeholder="1 tablet" />
              <MedField label={t('caregiver.medicineTime')} value={medForm.time} onChange={(v) => setMedForm({ ...medForm, time: v })} placeholder="09:00" type="time" />
              <MedField label={t('caregiver.medicinePeriod')} value={medForm.periodLabel} onChange={(v) => setMedForm({ ...medForm, periodLabel: v })} placeholder="Morning" />
              <div className="sm:col-span-2">
                <MedField label={t('caregiver.medicineNotes')} value={medForm.note} onChange={(v) => setMedForm({ ...medForm, note: v })} placeholder={t('caregiver.medicineNotesOptional')} />
              </div>
            </div>
            {medError && <p className="mt-2 text-[13px] font-bold text-coral-600" role="alert">{medError}</p>}
            <div className="mt-4 flex gap-2">
              <Button size="sm" onClick={handleSaveMedicine}>
                <Check size={16} aria-hidden /> {t('caregiver.save')}
              </Button>
              <Button variant="ghost" size="sm" onClick={closeMedicineForm}>
                <X size={16} aria-hidden /> {t('caregiver.cancel')}
              </Button>
            </div>
          </Card>
        )}

        <div className="mt-4 space-y-2">
          {medicines.length === 0 ? (
            <p className="text-[14px] font-bold text-ink-500">{t('caregiver.empty.medicines')}</p>
          ) : (
            medicines.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-2 rounded-2xl border border-line bg-white px-3 py-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cx(
                        'h-2.5 w-2.5 shrink-0 rounded-full',
                        m.active === false ? 'bg-ink-400' : m.status === 'completed' ? 'bg-pine-700' : 'bg-peach-500',
                      )}
                      aria-hidden
                    />
                    <p className="truncate font-display text-[16px] font-semibold text-pine-950">{m.name}</p>
                  </div>
                  <p className="text-[12px] font-bold text-ink-500">
                    {m.dosage} • {m.time} • {m.periodLabel}
                    {m.note ? ` • ${m.note}` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => toggleMedicineActive(m.id)}
                    aria-label={m.active === false ? t('caregiver.enable') : t('caregiver.disable')}
                    className="grid h-9 w-9 place-items-center rounded-xl border border-line text-ink-600 hover:border-pine-700/40 hover:text-pine-900"
                  >
                    {m.active === false ? <Check size={16} /> : <X size={16} />}
                  </button>
                  <button
                    onClick={() => openEditMedicine(m)}
                    aria-label={t('caregiver.editMedicine')}
                    className="grid h-9 w-9 place-items-center rounded-xl border border-line text-ink-600 hover:border-pine-700/40 hover:text-pine-900"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => removeMedicine(m.id)}
                    aria-label={t('caregiver.delete')}
                    className="grid h-9 w-9 place-items-center rounded-xl border border-line text-coral-600 hover:border-coral-500/40"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

function MedField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[12px] font-bold text-ink-600">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-xl border-[1.5px] border-line bg-white px-3 py-2 text-[14px] font-bold text-ink-700 shadow-card outline-none focus:border-pine-700"
      />
    </label>
  );
}
