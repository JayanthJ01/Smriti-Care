/**
 * Supabase database type definitions for Smriti Care.
 *
 * These types mirror supabase/schema.sql and are used by the Supabase client
 * and SupabaseDataProvider. They are kept compatible with the app-level types
 * in src/types/index.ts so the provider can map rows to app entities cleanly.
 */

import type { User } from '@supabase/supabase-js';

// ---- Shared column shapes ----

export interface DatabaseTimestamp {
  created_at: string;
  updated_at: string;
}

// ---- Tables ----

export interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  created_at: string;
  updated_at: string;
}

export interface CaregiverProfileRow {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface PatientProfileRow {
  id: string;
  user_id: string | null;
  name: string;
  date_of_birth: string | null;
  photo_url: string | null;
  caregiver_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CaregiverPatientLinkRow {
  id: string;
  caregiver_id: string;
  patient_id: string;
  role: string | null;
  created_at: string;
}

export interface MedicineRow {
  id: string;
  patient_id: string;
  name: string;
  dosage: string | null;
  scheduled_time: string | null;
  frequency: string | null;
  notes: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HydrationRow {
  id: string;
  patient_id: string;
  date_key: string;
  current_glasses: number;
  target_glasses: number;
  last_updated: string;
  created_at: string;
  updated_at: string;
}

export interface AppointmentRow {
  id: string;
  patient_id: string;
  doctor_name: string;
  specialty: string | null;
  date: string;
  time: string;
  location: string | null;
  note: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityRow {
  id: string;
  patient_id: string;
  type: string;
  title: string;
  description: string | null;
  category: string | null;
  occurred_at: string;
  created_at: string;
}

export interface GameResultRow {
  id: string;
  patient_id: string;
  game_id: string;
  game_category: string;
  difficulty_level: number;
  score: number;
  accuracy: number;
  rounds_completed: number;
  total_rounds: number;
  response_time_average_ms: number | null;
  mistakes: number;
  completion_status: string;
  started_at: string;
  completed_at: string | null;
  created_at: string;
}

// ---- Database shape ----

export type PublicTables = {
  profiles: {
    Row: ProfileRow;
    Insert: ProfileRow;
    Update: Partial<ProfileRow>;
  };
  caregiver_profiles: {
    Row: CaregiverProfileRow;
    Insert: CaregiverProfileRow;
    Update: Partial<CaregiverProfileRow>;
  };
  patient_profiles: {
    Row: PatientProfileRow;
    Insert: PatientProfileRow;
    Update: Partial<PatientProfileRow>;
  };
  caregiver_patient: {
    Row: CaregiverPatientLinkRow;
    Insert: CaregiverPatientLinkRow;
    Update: Partial<CaregiverPatientLinkRow>;
  };
  medicines: {
    Row: MedicineRow;
    Insert: MedicineRow;
    Update: Partial<MedicineRow>;
  };
  hydrations: {
    Row: HydrationRow;
    Insert: HydrationRow;
    Update: Partial<HydrationRow>;
  };
  appointments: {
    Row: AppointmentRow;
    Insert: AppointmentRow;
    Update: Partial<AppointmentRow>;
  };
  activities: {
    Row: ActivityRow;
    Insert: ActivityRow;
    Update: Partial<ActivityRow>;
  };
  game_results: {
    Row: GameResultRow;
    Insert: GameResultRow;
    Update: Partial<GameResultRow>;
  };
};

export type Database = {
  public: {
    Tables: PublicTables;
    Functions: Record<string, unknown>;
    Views: Record<string, unknown>;
  };
};

// Re-export convenience aliases matching the provider interface expectations.
export type { User };
