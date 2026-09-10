/**
 * Data provider types for Smriti Care.
 *
 * The active provider is selected once at app startup via
 * `src/services/data/factory.ts` from the `VITE_DATA_PROVIDER` config.
 *
 * UI / contexts / games must never call Supabase directly.
 * They call the DataProvider interface returned by the factory.
 */
import type {
  Patient,
  Medicine,
  Hydration,
  Appointment,
  ActivityItem,
  GameResult,
} from '../../types';

/**
 * Caregiver session resolved by the auth + caregiver provider layer.
 *
 * In demo mode this is a synthetic "current caregiver" used so the
 * caregiver dashboard still renders. In Supabase mode this is populated
 * from Supabase Auth + the caregiver_profiles / caregiver_patient tables.
 */
export interface CaregiverSession {
  id: string;
  name: string;
  email: string;
}

/**
 * Result of loading one patient + their related data.
 */
export interface PatientData {
  patient: Patient;
  medicines: Medicine[];
  hydration: Hydration;
  appointments: Appointment[];
  activities: ActivityItem[];
  gameResults: GameResult[];
  caregivers: string[]; // caregiver profile ids assigned to this patient
}

/**
 * Abstract persistence layer for Smriti Care patient / caregiver data.
 *
 * Implementors:
 *  - DemoDataProvider  →  localStorage-based demo persistence
 *  - SupabaseDataProvider → authenticated Supabase-backed persistence
 *
 * Both implementations MUST honor the same semantics so that
 * VITE_DATA_PROVIDER=demo and VITE_DATA_PROVIDER=supabase behave
 * identically from the consumer's perspective.
 */
export interface DataProvider {
  /** Current caregiver session (auth-derived in Supabase mode). */
  getCaregiverSession(): Promise<CaregiverSession | null>;

  /** All caregiver profiles visible to the current caregiver (read via RLS). */
  getCaregiverProfiles(): Promise<Array<{ id: string; name: string; email: string }>>;

  /** Relationship rows for the current caregiver (caregiver -> patients). */
  getCaregiverPatientLinks(): Promise<Array<{ caregiverId: string; patientId: string }>>;

  /** Patients the current caregiver is explicitly assigned to. */
  getAssignedPatients(): Promise<PatientData[]>;

  /** Full data for one patient (used by patient view + caregiver detail). */
  getPatientData(patientId: string): Promise<PatientData | null>;

  // ---- Medicines ----
  getMedicines(patientId: string): Promise<Medicine[]>;
  createMedicine(patientId: string, medicine: Medicine): Promise<{ ok: boolean; error?: string }>;
  updateMedicine(patientId: string, id: string, medicine: Medicine): Promise<{ ok: boolean; error?: string }>;
  removeMedicine(patientId: string, id: string): Promise<{ ok: boolean; error?: string }>;

  // ---- Hydration ----
  getHydration(patientId: string, dateKey: string): Promise<Hydration | null>;
  upsertHydration(patientId: string, hydration: Hydration): Promise<{ ok: boolean; error?: string }>;
  setHydrationTarget(patientId: string, dateKey: string, targetGlasses: number): Promise<{ ok: boolean; error?: string }>;

  // ---- Appointments ----
  getAppointments(patientId: string): Promise<Appointment[]>;
  createAppointment(patientId: string, appointment: Appointment): Promise<{ ok: boolean; error?: string }>;
  updateAppointment(patientId: string, id: string, appointment: Appointment): Promise<{ ok: boolean; error?: string }>;
  removeAppointment(patientId: string, id: string): Promise<{ ok: boolean; error?: string }>;

  // ---- Activities ----
  getActivities(patientId: string): Promise<ActivityItem[]>;
  createActivity(patientId: string, activity: ActivityItem): Promise<{ ok: boolean; error?: string }>;

  // ---- Game results ----
  getGameResults(patientId: string): Promise<GameResult[]>;
  saveGameResult(patientId: string, result: GameResult): Promise<{ ok: boolean; error?: string }>;
  removeGameResult(patientId: string, id: string): Promise<{ ok: boolean; error?: string }>;

  // ---- Patient-specific helpers ----
  /** Mark a medicine as taken for the current local day (persisted to activity + medicine state). */
  markMedicineTaken(
    patientId: string,
    medicineId: string,
    nowIso?: string,
  ): Promise<{ ok: boolean; error?: string }>;

  /** Mark a medicine as deferred for the current local day. */
  markMedicineDeferred(
    patientId: string,
    medicineId: string,
    nowIso?: string,
  ): Promise<{ ok: boolean; error?: string }>;

  /** Log a hydration drink for the current local day. */
  logHydrationDrink(patientId: string, dateKey: string, nowIso?: string): Promise<{ ok: boolean; error?: string }>;

  /** Mark an appointment as viewed. */
  markAppointmentViewed(
    patientId: string,
    appointmentId: string,
    nowIso?: string,
  ): Promise<{ ok: boolean; error?: string }>;
}
