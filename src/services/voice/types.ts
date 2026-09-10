export type VoiceIntent =
  | 'drink_water'
  | 'take_medicine'
  | 'next_appointment'
  | 'start_memory'
  | 'start_attention'
  | 'start_routine'
  | 'stop'
  | 'open_profile'
  | 'open_settings'
  | 'open_family'
  | 'open_activity'
  | 'open_appointments'
  | 'open_progress'
  | 'open_dashboard'
  | 'open_patient_app'
  ;

export interface RecognizedIntent {
  intent: VoiceIntent;
  text: string;
  language: string;
}

export type VoiceState =
  | 'idle'
  | 'listening'
  | 'processing'
  | 'recognized'
  | 'unrecognized'
  | 'unsupported'
  | 'error';
