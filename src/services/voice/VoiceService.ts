import { VoiceState, RecognizedIntent } from './types';

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onspeechstart?: (() => void) | null;
  onspeechend?: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: (new () => SpeechRecognition) | undefined;
    webkitSpeechRecognition: (new () => SpeechRecognition) | undefined;
  }
}

export type SpeechRecognitionEvent = Event & { results?: SpeechRecognitionResultList };
export type SpeechRecognitionErrorEvent = Event & {
  error?: string;
  message?: string;
};

/**
 * VoiceService — browser SpeechRecognition + optional TTS.
 *
 * Microphone activation MUST be deliberate; this service does not auto-listen.
 * It returns a stable cleanup function for the active session.
 */
export interface VoiceSession {
  stop: () => void;
}

function getRecognition(): SpeechRecognition | null {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  return new SR();
}

export interface VoiceServiceOptions {
  /**
   * Lang used for recognition. 'en-US' or 'as-IN' where supported.
   */
  lang?: string;
}

export function isVoiceSupported(): boolean {
  return !!getRecognition();
}

/**
 * Start a voice session.
 * Returns the session handle and fires `onTranscription` for each final result
 * and `onError`/`onState` for lifecycle events.
 */
export function startVoiceSession(
  opts: VoiceServiceOptions = {},
  onTranscription: (text: string) => void,
  onError: (err: string) => void,
  onStateChanged: (state: VoiceState) => void,
): VoiceSession | null {
  const recognition = getRecognition();
  if (!recognition) {
    onError('Voice recognition is not available on this device.');
    return null;
  }

  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = opts.lang ?? 'en-US';

  let stopped = false;

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    if (stopped) return;
    const results = event.results;
    if (!results || results.length === 0) return;
    const last = results[results.length - 1];
    if (last && last.isFinal) {
      const text = last[0]?.transcript ?? '';
      if (text.trim()) {
        onTranscription(text.trim());
      }
    }
  };

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    if (stopped) return;
    const err = event.error ?? 'unknown';
    if (err === 'no-speech') {
      onStateChanged('unrecognized');
      return;
    }
    onError(err === 'aborted' ? 'stopped' : `Voice error: ${err}`);
  };

  recognition.onend = () => {
    if (!stopped) {
      onStateChanged('idle');
    }
  };

  try {
    recognition.start();
    onStateChanged('listening');
  } catch (err) {
    onError('Could not start voice recognition.');
    return null;
  }

  return {
    stop() {
      stopped = true;
      try {
        recognition.stop();
      } catch {
        /* ignore */
      }
    },
  };
}

/**
 * Optional text-to-speech confirmation.
 * No-op if speech synthesis is unavailable.
 */
export function speak(text: string): void {
  if (!('speechSynthesis' in window)) return;
  try {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  } catch {
    /* ignore */
  }
}

const CONFIRMATIONS: Record<string, { en: string; as: string }> = {
  'hydrate.confirmed': { en: 'Water intake recorded.', as: 'পানীৰ পান লিপিবদ্ধ কৰা হ’ল।' },
  'medicine.confirmed': { en: 'Medicine recorded.', as: 'ঔষধ লিপিবদ্ধ কৰা হ’ল।' },
  'voice.started': { en: 'Starting {name} practice.', as: '{name} অভ্যাস আৰম্ভ কৰা হ’ল।' },
  'voice.stopped': { en: 'Stopped.', as: 'বন্ধ কৰা হ’ল।' },
  'voice.profileOpen': { en: 'Opening profile.', as: 'প্ৰ’ফাইল খোলা হ’ল।' },
  'voice.unrecognized': { en: 'Sorry, I did not understand.', as: 'দুঃখিত, বুজি নাপালোঁ।' },
  'voice.unrecognizedCaregiver': { en: 'Sorry, I did not understand.', as: 'দুঃখিত, বুজি নাপালোঁ।' },
  'voice.navDone': { en: 'Done.', as: 'হ’ল।' },
  'voice.noAppointments': { en: 'No upcoming appointments.', as: 'কোনো নিযুক্তি নাই।' },
  'voice.appointmentNext': { en: 'Next: {doctor} at {time}.', as: 'পৰৱৰ্তী: {time}ত {doctor}।' },
};

/** Localized confirmation text for a voice intent key. */
export function getConfirmationText(lang: string, key: string, fallbackName = ''): string {
  const entry = CONFIRMATIONS[key];
  const template = lang.startsWith('as') ? entry?.as ?? entry?.en ?? key : entry?.en ?? key;
  return template.replace('{name}', fallbackName);
}
