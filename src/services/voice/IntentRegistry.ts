import type { VoiceIntent } from './types';

const ENGLISH_PHRASES: Array<{ intent: VoiceIntent; patterns: ReadonlyArray<string> }> = [
  { intent: 'drink_water', patterns: ['drink water', 'i drank water', 'i drank a glass', 'water please', 'take water'] },
  { intent: 'take_medicine', patterns: ['take medicine', 'i took my medicine', 'taken medicine', 'medicine done'] },
  { intent: 'next_appointment', patterns: ['next appointment', 'what is my appointment', 'when is my appointment', 'my appointment', 'appointment'] },
  { intent: 'start_memory', patterns: ['memory game', 'memory', 'start memory', 'play memory'] },
  { intent: 'start_attention', patterns: ['attention game', 'attention', 'focus', 'start attention', 'play attention'] },
  { intent: 'start_routine', patterns: ['routine game', 'routine', 'recognition', 'recognition game', 'start routine', 'routine recognition'] },
  { intent: 'stop', patterns: ['stop', 'enough', 'quit voice', 'done voice', 'close voice'] },
  { intent: 'open_profile', patterns: ['open profile', 'my profile', 'profile'] },
  { intent: 'open_settings', patterns: ['open settings', 'settings', 'show settings'] },
  { intent: 'open_family', patterns: ['open family', 'family', 'patients', 'go to family'] },
  { intent: 'open_activity', patterns: ['open activity', 'activity', 'activity log', 'recent activity'] },
  { intent: 'open_appointments', patterns: ['open appointments', 'appointments', 'appointment list'] },
  { intent: 'open_progress', patterns: ['open progress', 'cognitive progress', 'progress', 'games progress'] },
  { intent: 'open_dashboard', patterns: ['open dashboard', 'dashboard', 'home', 'back to dashboard'] },
  { intent: 'open_patient_app', patterns: ['open patient app', 'patient app', 'app preview'] },
];

const ASSAMESE_PHRASES: Array<{ intent: VoiceIntent; patterns: ReadonlyArray<string> }> = [
  { intent: 'drink_water', patterns: ['পানী পান', 'এটা গ্লাছ পানী', 'পানী খাও', 'water'] },
  { intent: 'take_medicine', patterns: ['ঔষধ খোৱা', 'ঔষধ লো', 'medicine খোৱা', 'ঔষধ', 'medicine'] },
  { intent: 'next_appointment', patterns: ['পৰৱৰ্তী নিযুক্তি', 'আমাৰ নিযুক্তি কেতিয়া', 'নিযুক্তি', 'appointment'] },
  { intent: 'start_memory', patterns: ['মৰম সাজি', 'memory গেম', 'memory', 'smriti game'] },
  { intent: 'start_attention', patterns: ['আন্তৰীক্ষণ', 'attention গেম', 'attention', 'focus'] },
  { intent: 'start_routine', patterns: ['দৈনন্দিন ক্ৰম', 'routine গেম', 'routine', 'recognition', 'চিনাক্তকৰণ'] },
  { intent: 'stop', patterns: ['বন্ধ কৰক', 'thek', 'জমা কৰক', 'stop'] },
  { intent: 'open_family', patterns: ['পৰিয়াল', 'family', 'patient'] },
  { intent: 'open_activity', patterns: ['কাৰ্য্য', 'activity', 'সাম্প্ৰতিকৰ তথ্য', 'recent activity'] },
  { intent: 'open_appointments', patterns: ['নিযুক্তিৰ তালিকা', 'appointments', 'নিযুক্তি'] },
  { intent: 'open_progress', patterns: ['এটা প্ৰগতি', 'progress', 'গেমৰ তথ্য', 'cognitive progress'] },
  { intent: 'open_dashboard', patterns: ['ড্বাশবৰ্ড', 'dashboard', 'হোম', 'home'] },
];

export function resolveIntent(transcript: string, lang: string): VoiceIntent | null {
  const normalized = normalizeTranscript(transcript);
  if (!normalized) return null;

  const phraseList = lang.startsWith('as') ? ASSAMESE_PHRASES : ENGLISH_PHRASES;

  for (const entry of phraseList) {
    for (const pattern of entry.patterns) {
      const normalizedPattern = normalizeTranscript(pattern);
      if (!normalizedPattern) continue;
      if (normalized.includes(normalizedPattern) || normalizedPattern.includes(normalized)) {
        return entry.intent;
      }
    }
  }

  return null;
}

function normalizeTranscript(raw: string): string {
  return raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

