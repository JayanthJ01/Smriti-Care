import { useCallback, useRef, useState } from 'react';
import type { VoiceState, RecognizedIntent } from './types';
import { resolveIntent } from './IntentRegistry';
import { executePatientIntent, executeCaregiverIntent, logVoiceActivity } from './VoiceActionExecutor';
import { startVoiceSession, speak, isVoiceSupported, getConfirmationText } from './VoiceService';
import { useLanguage } from '../../contexts/LanguageContext';

export interface UseVoiceReturn {
  supported: boolean;
  state: VoiceState;
  lastIntent: RecognizedIntent | null;
  lastAction: { intent: string; description: string; executed: boolean } | null;
  startListening: () => void;
  stopListening: () => void;
  speakConfirmation: (text: string) => void;
  resetLast: () => void;
}

export interface UseVoiceDeps {
  role: 'patient' | 'caregiver';
  patientId?: string;
  hydrate?: (n: number) => void;
  logMedicineTaken?: () => void;
  appointments?: { date: string; time: string; doctorName?: string; status?: string }[];
  setPatientMode?: (mode: string) => void;
  setCaregiverSection?: (section: string) => void;
  onGameLaunch?: (gameId: string) => void;
}

export function useVoice(deps: UseVoiceDeps): UseVoiceReturn {
  const { lang } = useLanguage();
  const [state, setState] = useState<VoiceState>('idle');
  const [lastIntent, setLastIntent] = useState<RecognizedIntent | null>(null);
  const [lastAction, setLastAction] = useState<{ intent: string; description: string; executed: boolean } | null>(null);

  const sessionRef = useRef<{ stop: () => void } | null>(null);

  const stopListening = useCallback(() => {
    sessionRef.current?.stop();
    sessionRef.current = null;
  }, []);

  const resetLast = useCallback(() => {
    setLastIntent(null);
    setLastAction(null);
  }, []);

  const speakConfirmation = useCallback(
    (text: string) => {
      speak(text);
    },
    [],
  );

  const startListening = useCallback(() => {
    if (!isVoiceSupported()) {
      setState('unsupported');
      return;
    }

    stopListening();

    const session = startVoiceSession(
      { lang: lang.startsWith('as') ? 'as-IN' : 'en-US' },
      (transcript) => {
        const intent = resolveIntent(transcript, lang);
        if (!intent) {
          setState('unrecognized');
          setLastAction({ intent: 'unknown', description: 'Could not understand that command.', executed: false });
          return;
        }

        const recognized: RecognizedIntent = { intent, text: transcript, language: lang };
        setLastIntent(recognized);
        setState('processing');

        let message = '';
        let executed = false;
        let description = '';
        if (deps.role === 'caregiver') {
          message = executeCaregiverIntent(intent, recognized, {
            setSection: (s: string) => deps.setCaregiverSection?.(s),
          });
          executed = true;
          description = message;
        } else {
          message = executePatientIntent(
            intent,
            recognized,
            {
              hydrate: (n: number) => deps.hydrate?.(n),
              logMedicineTaken: () => deps.logMedicineTaken?.(),
              appointments: (deps.appointments ?? []) as never[],
              setPatientMode: (m: string) => deps.setPatientMode?.(m),
            },
            (gameId: string) => deps.onGameLaunch?.(gameId),
          );
          executed = true;
          description = message;
        }
        setLastAction({ intent, description, executed });

        if (executed) {
          setState('recognized');
          speak(message || getConfirmationText(lang, 'voice.navDone'));
          if (deps.patientId) {
            logVoiceActivity(deps.patientId, intent, transcript);
          }
        } else {
          setState('unrecognized');
        }

        setTimeout(() => setState('idle'), 1200);
      },
      (err) => {
        setState('error');
        setTimeout(() => setState('idle'), 1500);
      },
      setState,
    );

    sessionRef.current = session;
  }, [deps, lang, stopListening]);

  return {
    supported: isVoiceSupported(),
    state,
    lastIntent,
    lastAction,
    startListening,
    stopListening,
    speakConfirmation,
    resetLast,
  };
}
