import { VoiceIntent } from './types';

interface Entry {
  intent: VoiceIntent;
  labelKey: string;
  exampleEn: string;
  exampleAs?: string;
}

/**
 * VoiceCommandPalette — the supported voice commands.
 *
 * Used by the UI to display "Voice commands available" help and by tests
 * to assert the command set.
 */
export const VOICE_COMMAND_PALETTE: readonly Entry[] = [
  {
    intent: 'drink_water',
    labelKey: 'voice.commands.drinkWater',
    exampleEn: 'Drink water',
    exampleAs: 'পানী পান',
  },
  {
    intent: 'take_medicine',
    labelKey: 'voice.commands.takeMedicine',
    exampleEn: 'Take medicine',
    exampleAs: 'ঔষধ খোৱা',
  },
  {
    intent: 'next_appointment',
    labelKey: 'voice.commands.nextAppointment',
    exampleEn: 'Next appointment',
    exampleAs: 'পৰৱৰ্তী নিযুক্তি',
  },
  {
    intent: 'start_memory',
    labelKey: 'voice.commands.startMemory',
    exampleEn: 'Start memory game',
    exampleAs: 'মৰম সাজি',
  },
  {
    intent: 'start_attention',
    labelKey: 'voice.commands.startAttention',
    exampleEn: 'Start attention game',
    exampleAs: 'আন্তৰীক্ষণ',
  },
  {
    intent: 'start_routine',
    labelKey: 'voice.commands.startRoutine',
    exampleEn: 'Start routine game',
    exampleAs: 'দৈনন্দিন ক্ৰম',
  },
  {
    intent: 'stop',
    labelKey: 'voice.commands.stop',
    exampleEn: 'Stop',
    exampleAs: 'বন্ধ কৰক',
  },
  {
    intent: 'open_family',
    labelKey: 'voice.commands.openFamily',
    exampleEn: 'Open family',
    exampleAs: 'পৰিয়াল',
  },
  {
    intent: 'open_activity',
    labelKey: 'voice.commands.openActivity',
    exampleEn: 'Open activity',
    exampleAs: 'কাৰ্য্য',
  },
  {
    intent: 'open_appointments',
    labelKey: 'voice.commands.openAppointments',
    exampleEn: 'Open appointments',
    exampleAs: 'নিযুক্তিৰ তালিকা',
  },
  {
    intent: 'open_progress',
    labelKey: 'voice.commands.openProgress',
    exampleEn: 'Open progress',
    exampleAs: 'প্ৰগতি',
  },
  {
    intent: 'open_dashboard',
    labelKey: 'voice.commands.openDashboard',
    exampleEn: 'Open dashboard',
    exampleAs: 'ড্বাশবৰ্ড',
  },
  {
    intent: 'open_patient_app',
    labelKey: 'voice.commands.openPatientApp',
    exampleEn: 'Open patient app',
    exampleAs: 'patient app',
  },
] as const;

export function getIntentLabel(intent: VoiceIntent): string {
  return VOICE_COMMAND_PALETTE.find((e) => e.intent === intent)?.labelKey ?? intent;
}
