export type SupportedLanguage = 'en' | 'as';

export type MedicineStatus = 'pending' | 'completed' | 'missed' | 'deferred';

export type AppointmentStatus = 'upcoming' | 'today' | 'completed' | 'cancelled';

export type ActivityType =
  | 'medicine_completed'
  | 'medicine_deferred'
  | 'hydration_logged'
  | 'appointment_viewed'
  | 'appointment_reminder'
  | 'cognitive_game_completed'
  | 'voice_action';

export type ActivityKind = 'medicine' | 'water' | 'game' | 'appointment' | 'checkin';

export interface Patient {
  id: string;
  name: string;
  nameAssamese: string;
  age: number;
  village: string;
  villageAssamese: string;
  language: SupportedLanguage;
  greetingNote: string;
  greetingNoteAssamese: string;
  avatarInitials: string;
}

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  time: string;
  periodLabel: string;
  periodLabelAssamese: string;
  status: MedicineStatus;
  note?: string;
  completedAt?: string;
  /** Caregiver enable/disable — absent/true = active (demo back-compat). */
  active?: boolean;
}

export interface Hydration {
  currentGlasses: number;
  targetGlasses: number;
  lastTakenAt: string;
  /** Local day key (YYYY-MM-DD) the progress belongs to. */
  dateKey?: string;
}

export interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  note: string;
  status: AppointmentStatus;
}

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  titleAssamese: string;
  /** Optional i18n key that overrides title/titleAssamese. */
  titleKey?: string;
  time: string;
  kind: ActivityKind;
  detail: string;
  /** ISO timestamp used for ordering. */
  timestamp?: string;
  patientId?: string;
  meta?: Record<string, string | number | boolean | null>;
}

export interface CognitiveActivity {
  id: 'memory' | 'attention' | 'routine';
  titleKey: string;
  descriptionKey: string;
  icon: 'memory' | 'attention' | 'routine';
  accent: 'amber' | 'pine' | 'leaf';
  estimatedMinutes: number;
}

export type GameCategory = 'memory' | 'attention' | 'routine-recognition';

export type CompletionStatus = 'completed' | 'abandoned';

export interface GameRoundResult {
  /** Round index (1-based). */
  round: number;
  correct: boolean;
  /** Response time in ms. */
  responseTimeMs: number;
  /** 0 = first attempt success. */
  mistakes: number;
}

export interface GameResult {
  id: string;
  gameId: string;
  patientId: string;
  sessionId: string;
  gameCategory: GameCategory;
  score: number;
  accuracy: number;
  correctAnswers: number;
  incorrectAnswers: number;
  mistakes: number;
  responseTimeAverage: number;
  duration: number;
  difficultyLevel: string;
  roundsCompleted: number;
  completionStatus: CompletionStatus;
  startedAt: string;
  completedAt: string;
  /** Round/category metadata so later analytics can distinguish routine vs recognition. */
  metadata: Record<string, string | number | boolean | null>;
}

export interface GameSession {
  gameId: string;
  gameCategory: GameCategory;
  patientId: string;
  sessionId: string;
  currentRound: number;
  totalRounds: number;
  score: number;
  correctAnswers: number;
  incorrectAnswers: number;
  mistakes: number;
  responseTimes: number[];
  startedAt: string;
  difficultyLevel: string;
  completionStatus: CompletionStatus;
}

export interface CaregiverSummary {
  totalPatients: number;
  medicinesToday: { done: number; total: number };
  hydrationAvg: number;
  appointmentsToday: number;
  activeStreakDays: number;
}
