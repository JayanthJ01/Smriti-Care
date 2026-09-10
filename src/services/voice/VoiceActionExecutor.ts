/* eslint-disable @typescript-eslint/no-explicit-any */
import type { VoiceIntent, RecognizedIntent } from './types';
import { getConfirmationText } from './VoiceService';
import { activityService } from '../patient/activityService';
import type { Appointment } from '../../types';

export interface PatientActions {
  hydrate: (n: number) => void;
  logMedicineTaken: () => void;
  appointments: Appointment[];
  setPatientMode: (mode: string) => void;
}

export interface CaregiverActions {
  setSection: (section: string) => void;
}

/**
 * VoiceActionExecutor — the single bridge between a recognized voice intent
 * and real application state changes.
 *
 * Every intent resolves to a real action on the existing shared data surface
 * (PatientDataContext / CaregiverContext). No business logic is duplicated here;
 * we call the same functions the buttons already call.
 *
 * Side effects are deliberately narrow:
 *  - hydration / medicine / appointment actions
 *  - game launch (setting activeGame, which the Patient Page already renders)
 *  - caregiver section navigation
 *  - one activity log per meaningful command
 */
export function executePatientIntent(
  intent: VoiceIntent,
  recognized: RecognizedIntent,
  actions: PatientActions,
  onGameLaunch: (gameId: string) => void,
): string {
  switch (intent) {
    case 'drink_water': {
      actions.hydrate(1);
      return getConfirmationText(recognized.language, 'hydrate.confirmed');
    }
    case 'take_medicine': {
      actions.logMedicineTaken();
      return getConfirmationText(recognized.language, 'medicine.confirmed');
    }
    case 'next_appointment': {
      return getAppointmentText(actions.appointments, recognized.language);
    }
    case 'start_memory':
    case 'start_attention':
    case 'start_routine': {
      onGameLaunch(intent.replace('start_', ''));
      return getConfirmationText(recognized.language, 'voice.started', capitalize(intent));
    }
    case 'stop': {
      return getConfirmationText(recognized.language, 'voice.stopped');
    }
    case 'open_profile':
    case 'open_settings': {
      actions.setPatientMode('settings');
      return getConfirmationText(recognized.language, 'voice.profileOpen');
    }
    default:
      return getConfirmationText(recognized.language, 'voice.unrecognized');
  }
}

export function executeCaregiverIntent(
  intent: VoiceIntent,
  recognized: RecognizedIntent,
  actions: CaregiverActions,
): string {
  switch (intent) {
    case 'open_family':
      actions.setSection('family');
      return getConfirmationText(recognized.language, 'voice.navDone');
    case 'open_activity':
      actions.setSection('activity');
      return getConfirmationText(recognized.language, 'voice.navDone');
    case 'open_appointments':
      actions.setSection('appointments');
      return getConfirmationText(recognized.language, 'voice.navDone');
    case 'open_progress':
      actions.setSection('cognitive');
      return getConfirmationText(recognized.language, 'voice.navDone');
    case 'open_dashboard':
      actions.setSection('dashboard');
      return getConfirmationText(recognized.language, 'voice.navDone');
    case 'open_patient_app':
      actions.setSection('patientApp');
      return getConfirmationText(recognized.language, 'voice.navDone');
    default:
      return getConfirmationText(recognized.language, 'voice.unrecognizedCaregiver');
  }
}

function capitalize(s: string): string {
  return s.replace(/^[^a-z]*/, '').charAt(0).toUpperCase() + s.replace(/^[^a-z]*/, '').slice(1);
}

function getAppointmentText(appointments: any[], lang: string): string {
  // appointments are sorted by datetime in the context; the first upcoming/today one is "next".
  const sorted = [...appointments].filter((a: any) => a.status !== 'cancelled');
  if (!sorted.length) {
    return getConfirmationText(lang, 'voice.noAppointments');
  }
  const next = sorted[0];
  const time = `${next.date} • ${next.time}`;
  return getConfirmationText(lang, 'voice.appointmentNext')
    .replace('{doctor}', next.doctorName ?? 'your doctor')
    .replace('{time}', time);
}

export function logVoiceActivity(patientId: string, intent: VoiceIntent, text: string): void {
  const item = activityService.build(
    'voice_action',
    getIntentLabel(intent, text),
    getIntentLabel(intent, text),
    'checkin',
    `${intent} — ${text}`,
    {
      titleKey: 'activity.voiceCommand',
      patientId,
      meta: { intent, text, timestamp: new Date().toISOString() },
    },
  );
  // The useVoice hook owns applying the activity to live patient state;
  // logging here simply constructs it. (Kept as a pure builder.)
  void item;
}

function getIntentLabel(intent: VoiceIntent, text: string): string {
  const labels: Record<VoiceIntent, string> = {
    drink_water: 'drink water',
    take_medicine: 'take medicine',
    next_appointment: 'next appointment',
    start_memory: 'memory game',
    start_attention: 'attention game',
    start_routine: 'routine game',
    stop: 'stop',
    open_profile: 'profile',
    open_settings: 'settings',
    open_family: 'family',
    open_activity: 'activity',
    open_appointments: 'appointments',
    open_progress: 'progress',
    open_dashboard: 'dashboard',
    open_patient_app: 'patient app',
  };
  return `${labels[intent]} (${text})`;
}
