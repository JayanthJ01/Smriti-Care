import type { SupabaseClient } from '@supabase/supabase-js';
import type { CaregiverSession, DataProvider, PatientData } from '../types';
import type { Medicine, Hydration, Appointment, ActivityItem, GameResult, Patient } from '../../../types';
import { todayKey } from '../../../utils/datetime';
import type {
  ActivityRow,
  AppointmentRow,
  CaregiverPatientLinkRow,
  CaregiverProfileRow,
  GameResultRow,
  HydrationRow,
  MedicineRow,
  PatientProfileRow,
  ProfileRow,
} from '../../supabase/database.types';

type Ok = { ok: boolean; error?: string };

const okResult: Ok = { ok: true };

function errMsg(err: unknown): string {
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object' && 'message' in err) return String((err as { message: unknown }).message);
  return 'Supabase error.';
}

function fail(error: unknown): Ok {
  return { ok: false, error: errMsg(error) };
}

function mapPatient(row: PatientProfileRow): Patient {
  return {
    id: row.id,
    name: row.name ?? 'Patient',
    nameAssamese: row.name ?? 'ৰোগী',
    age: 0,
    village: '',
    villageAssamese: '',
    language: 'en',
    greetingNote: '',
    greetingNoteAssamese: '',
    avatarInitials: (row.name ?? 'P').split(/\s+/).map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || 'P',
  };
}

function mapMedicine(row: MedicineRow): Medicine {
  return {
    id: row.id,
    name: row.name,
    dosage: row.dosage ?? '',
    time: row.scheduled_time ?? '',
    periodLabel: row.frequency ?? '',
    periodLabelAssamese: row.frequency ?? '',
    status: 'pending',
    note: row.notes ?? undefined,
    active: row.active,
  };
}

function mapHydration(row: HydrationRow, fallbackDateKey: string): Hydration {
  return {
    currentGlasses: row.current_glasses ?? 0,
    targetGlasses: row.target_glasses ?? 8,
    lastTakenAt: row.last_updated ?? '',
    dateKey: row.date_key ?? fallbackDateKey,
  };
}

function mapAppointment(row: AppointmentRow): Appointment {
  const status: Appointment['status'] =
    row.status === 'today' || row.status === 'completed' || row.status === 'cancelled' ? row.status : 'upcoming';
  return {
    id: row.id,
    doctorName: row.doctor_name,
    specialty: row.specialty ?? '',
    date: row.date,
    time: row.time,
    location: row.location ?? '',
    note: row.note ?? '',
    status,
  };
}

function mapActivity(row: ActivityRow): ActivityItem {
  const kind: ActivityItem['kind'] =
    row.category === 'medicine' || row.category === 'water' || row.category === 'game' || row.category === 'appointment'
      ? row.category
      : 'checkin';
  return {
    id: row.id,
    type: 'voice_action',
    title: row.title,
    titleAssamese: row.title,
    time: row.occurred_at ?? row.created_at,
    timestamp: row.occurred_at ?? row.created_at,
    kind,
    detail: row.description ?? '',
    patientId: row.patient_id,
  };
}

function mapGameResult(row: GameResultRow): GameResult {
  const category: GameResult['gameCategory'] =
    row.game_category === 'attention' || row.game_category === 'routine-recognition' ? row.game_category : 'memory';
  return {
    id: row.id,
    gameId: row.game_id,
    patientId: row.patient_id,
    sessionId: row.id,
    gameCategory: category,
    score: row.score ?? 0,
    accuracy: Number(row.accuracy ?? 0),
    correctAnswers: 0,
    incorrectAnswers: row.mistakes ?? 0,
    mistakes: row.mistakes ?? 0,
    responseTimeAverage: row.response_time_average_ms ?? 0,
    duration: 0,
    difficultyLevel: String(row.difficulty_level ?? 1),
    roundsCompleted: row.rounds_completed ?? 0,
    completionStatus: row.completion_status === 'abandoned' ? 'abandoned' : 'completed',
    startedAt: row.started_at,
    completedAt: row.completed_at ?? row.started_at,
    metadata: {},
  };
}

export class SupabaseDataProvider implements DataProvider {
  constructor(private readonly client: SupabaseClient) {}

  async getCaregiverSession(): Promise<CaregiverSession | null> {
    const { data, error } = await this.client.auth.getSession();
    if (error || !data.session?.user) return null;
    const user = data.session.user;
    const { data: profile } = await this.client.from('profiles').select('id,email,full_name').eq('id', user.id).maybeSingle();
    const row = profile as Pick<ProfileRow, 'id' | 'email' | 'full_name'> | null;
    return { id: user.id, name: row?.full_name ?? user.email ?? 'Caregiver', email: row?.email ?? user.email ?? '' };
  }

  async getCaregiverProfiles() {
    const { data, error } = await this.client.from('caregiver_profiles').select('id,name,email');
    if (error || !data) return [];
    return (data as Pick<CaregiverProfileRow, 'id' | 'name' | 'email'>[]).map((r) => ({ id: r.id, name: r.name, email: r.email }));
  }

  async getCaregiverPatientLinks() {
    const session = await this.getCaregiverSession();
    if (!session) return [];
    const { data, error } = await this.client.from('caregiver_patient').select('caregiver_id,patient_id').eq('caregiver_id', session.id);
    if (error || !data) return [];
    return (data as Pick<CaregiverPatientLinkRow, 'caregiver_id' | 'patient_id'>[]).map((r) => ({ caregiverId: r.caregiver_id, patientId: r.patient_id }));
  }

  async getAssignedPatients(): Promise<PatientData[]> {
    const links = await this.getCaregiverPatientLinks();
    const out: PatientData[] = [];
    for (const link of links) {
      const d = await this.getPatientData(link.patientId);
      if (d) out.push(d);
    }
    return out;
  }

  async getPatientData(patientId: string): Promise<PatientData | null> {
    const { data: patientRow, error: patientError } = await this.client.from('patient_profiles').select('*').eq('id', patientId).maybeSingle();
    if (patientError || !patientRow) return null;
    const dateKey = todayKey();
    const [medicines, hydration, appointments, activities, gameResults, linksRes] = await Promise.all([
      this.getMedicines(patientId),
      this.getHydration(patientId, dateKey),
      this.getAppointments(patientId),
      this.getActivities(patientId),
      this.getGameResults(patientId),
      this.client.from('caregiver_patient').select('caregiver_id').eq('patient_id', patientId),
    ]);
    const linkRows = (linksRes.data ?? []) as Pick<CaregiverPatientLinkRow, 'caregiver_id'>[];
    return {
      patient: mapPatient(patientRow as PatientProfileRow),
      medicines,
      hydration: hydration ?? { currentGlasses: 0, targetGlasses: 8, lastTakenAt: '', dateKey },
      appointments,
      activities,
      gameResults,
      caregivers: linkRows.map((r) => r.caregiver_id),
    };
  }

  async getMedicines(patientId: string): Promise<Medicine[]> {
    const { data, error } = await this.client.from('medicines').select('*').eq('patient_id', patientId).order('scheduled_time', { ascending: true });
    if (error || !data) return [];
    return (data as MedicineRow[]).map(mapMedicine);
  }

  async createMedicine(patientId: string, medicine: Medicine): Promise<Ok> {
    try {
      const { error } = await this.client.from('medicines').insert({
        patient_id: patientId, name: medicine.name, dosage: medicine.dosage ?? null,
        scheduled_time: medicine.time ?? null, frequency: medicine.periodLabel ?? null,
        notes: medicine.note ?? null, active: medicine.active !== false,
      });
      return error ? fail(error) : okResult;
    } catch (e) {
      return fail(e);
    }
  }

  async updateMedicine(patientId: string, id: string, medicine: Medicine): Promise<Ok> {
    try {
      const { error } = await this.client.from('medicines').update({
        name: medicine.name, dosage: medicine.dosage ?? null,
        scheduled_time: medicine.time ?? null, frequency: medicine.periodLabel ?? null,
        notes: medicine.note ?? null, active: medicine.active !== false,
      }).eq('id', id).eq('patient_id', patientId);
      return error ? fail(error) : okResult;
    } catch (e) {
      return fail(e);
    }
  }

  async removeMedicine(patientId: string, id: string): Promise<Ok> {
    try {
      const { error } = await this.client.from('medicines').delete().eq('id', id).eq('patient_id', patientId);
      return error ? fail(error) : okResult;
    } catch (e) {
      return fail(e);
    }
  }

  async getHydration(patientId: string, dateKey: string): Promise<Hydration | null> {
    const { data, error } = await this.client.from('hydrations').select('*').eq('patient_id', patientId).eq('date_key', dateKey).maybeSingle();
    if (error || !data) return null;
    return mapHydration(data as HydrationRow, dateKey);
  }

  async upsertHydration(patientId: string, hydration: Hydration): Promise<Ok> {
    try {
      const dateKey = hydration.dateKey ?? todayKey();
      const { error } = await this.client.from('hydrations').upsert({
        patient_id: patientId, date_key: dateKey,
        current_glasses: hydration.currentGlasses ?? 0, target_glasses: hydration.targetGlasses ?? 8,
        last_updated: hydration.lastTakenAt || new Date().toISOString(),
      }, { onConflict: 'patient_id,date_key' });
      return error ? fail(error) : okResult;
    } catch (e) {
      return fail(e);
    }
  }

  async setHydrationTarget(patientId: string, dateKey: string, targetGlasses: number): Promise<Ok> {
    const existing = await this.getHydration(patientId, dateKey);
    return this.upsertHydration(patientId, {
      currentGlasses: existing?.currentGlasses ?? 0, targetGlasses,
      lastTakenAt: existing?.lastTakenAt ?? '', dateKey,
    });
  }

  async getAppointments(patientId: string): Promise<Appointment[]> {
    const { data, error } = await this.client.from('appointments').select('*').eq('patient_id', patientId).order('date', { ascending: true });
    if (error || !data) return [];
    return (data as AppointmentRow[]).map(mapAppointment);
  }

  async createAppointment(patientId: string, appointment: Appointment): Promise<Ok> {
    try {
      const { error } = await this.client.from('appointments').insert({
        patient_id: patientId, doctor_name: appointment.doctorName, specialty: appointment.specialty ?? null,
        date: appointment.date, time: appointment.time, location: appointment.location ?? null,
        note: appointment.note ?? null, status: appointment.status,
      });
      return error ? fail(error) : okResult;
    } catch (e) {
      return fail(e);
    }
  }

  async updateAppointment(patientId: string, id: string, appointment: Appointment): Promise<Ok> {
    try {
      const { error } = await this.client.from('appointments').update({
        doctor_name: appointment.doctorName, specialty: appointment.specialty ?? null,
        date: appointment.date, time: appointment.time, location: appointment.location ?? null,
        note: appointment.note ?? null, status: appointment.status,
      }).eq('id', id).eq('patient_id', patientId);
      return error ? fail(error) : okResult;
    } catch (e) {
      return fail(e);
    }
  }

  async removeAppointment(patientId: string, id: string): Promise<Ok> {
    try {
      const { error } = await this.client.from('appointments').delete().eq('id', id).eq('patient_id', patientId);
      return error ? fail(error) : okResult;
    } catch (e) {
      return fail(e);
    }
  }


  async getActivities(patientId: string): Promise<ActivityItem[]> {
    const { data, error } = await this.client.from('activities').select('*').eq('patient_id', patientId).order('occurred_at', { ascending: false }).limit(50);
    if (error || !data) return [];
    return (data as ActivityRow[]).map(mapActivity);
  }

  async createActivity(patientId: string, activity: ActivityItem): Promise<Ok> {
    try {
      const { error } = await this.client.from('activities').insert({
        patient_id: patientId, type: activity.type, title: activity.title,
        description: activity.detail ?? null, category: activity.kind ?? null,
        occurred_at: activity.timestamp ?? new Date().toISOString(),
      });
      return error ? fail(error) : okResult;
    } catch (e) {
      return fail(e);
    }
  }

  async getGameResults(patientId: string): Promise<GameResult[]> {
    const { data, error } = await this.client.from('game_results').select('*').eq('patient_id', patientId).order('started_at', { ascending: false }).limit(100);
    if (error || !data) return [];
    return (data as GameResultRow[]).map(mapGameResult);
  }

  async saveGameResult(patientId: string, result: GameResult): Promise<Ok> {
    try {
      const level = Number.parseInt(String(result.difficultyLevel ?? '1'), 10);
      const { error } = await this.client.from('game_results').insert({
        patient_id: patientId, game_id: result.gameId, game_category: result.gameCategory,
        difficulty_level: Number.isFinite(level) ? level : 1,
        score: result.score ?? 0, accuracy: result.accuracy ?? 0,
        rounds_completed: result.roundsCompleted ?? 0, total_rounds: result.roundsCompleted ?? 0,
        response_time_average_ms: typeof result.responseTimeAverage === 'number' ? Math.round(result.responseTimeAverage) : null,
        mistakes: result.mistakes ?? 0, completion_status: result.completionStatus ?? 'completed',
        started_at: result.startedAt, completed_at: result.completedAt ?? null,
      });
      return error ? fail(error) : okResult;
    } catch (e) {
      return fail(e);
    }
  }

  async removeGameResult(patientId: string, id: string): Promise<Ok> {
    try {
      const { error } = await this.client.from('game_results').delete().eq('id', id).eq('patient_id', patientId);
      return error ? fail(error) : okResult;
    } catch (e) {
      return fail(e);
    }
  }

  async markMedicineTaken(patientId: string, medicineId: string, stamp = new Date().toISOString()): Promise<Ok> {
    const meds = await this.getMedicines(patientId);
    const med = meds.find((m) => m.id === medicineId);
    if (!med) return fail('Medicine not found.');
    const upd = await this.updateMedicine(patientId, medicineId, { ...med, status: 'completed', completedAt: stamp });
    if (!upd.ok) return upd;
    await this.createActivity(patientId, {
      id: 'act-' + Date.now(), type: 'medicine_completed', title: 'Medicine taken: ' + med.name,
      titleAssamese: 'ঔষধ খোৱা হ’ল', time: stamp, timestamp: stamp, kind: 'medicine',
      detail: med.dosage ?? '', patientId,
    });
    return okResult;
  }

  async markMedicineDeferred(patientId: string, medicineId: string, stamp = new Date().toISOString()): Promise<Ok> {
    const meds = await this.getMedicines(patientId);
    const med = meds.find((m) => m.id === medicineId);
    if (!med) return fail('Medicine not found.');
    const upd = await this.updateMedicine(patientId, medicineId, { ...med, status: 'deferred' });
    if (!upd.ok) return upd;
    await this.createActivity(patientId, {
      id: 'act-' + Date.now(), type: 'medicine_deferred', title: 'Medicine deferred: ' + med.name,
      titleAssamese: 'ঔষধ পিছলৈ', time: stamp, timestamp: stamp, kind: 'medicine',
      detail: med.dosage ?? '', patientId,
    });
    return okResult;
  }

  async logHydrationDrink(patientId: string, dateKey: string, stamp = new Date().toISOString()): Promise<Ok> {
    const existing = await this.getHydration(patientId, dateKey);
    return this.upsertHydration(patientId, {
      currentGlasses: (existing?.currentGlasses ?? 0) + 1,
      targetGlasses: existing?.targetGlasses ?? 8, lastTakenAt: stamp, dateKey,
    });
  }

  async markAppointmentViewed(patientId: string, appointmentId: string, stamp = new Date().toISOString()): Promise<Ok> {
    await this.createActivity(patientId, {
      id: 'act-' + Date.now(), type: 'appointment_viewed', title: 'Appointment viewed',
      titleAssamese: 'এপইণ্টমেণ্ট', time: stamp, timestamp: stamp, kind: 'appointment',
      detail: appointmentId, patientId,
    });
    return okResult;
  }
}
