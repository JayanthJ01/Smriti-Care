import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type {
  ActivityItem,
  Appointment,
  GameCategory,
  GameResult,
  GameSession,
  Hydration,
  Medicine,
  Patient,
} from '../types';
import { demoActivities, demoAppointments, demoHydration, demoMedicines, demoPatient } from '../data/demoData';
import { activityService } from '../services/patient/activityService';
import { nowDisplayTime, todayKey } from '../utils/datetime';
import { appConfig } from '../app/config';
import { getProvider } from '../services/data/factory';
import type { PatientData } from '../services/data/types';

const STORAGE_KEY = 'smriti-patient-data-v1';
const GAME_RESULTS_KEY = 'smriti-game-results-v1';
const TAP_GUARD_MS = 250;
const LAST_TAP_KEY = 'smriti-last-tap-v1';
const SELECTED_PATIENT_KEY = 'smriti-selected-patient-v1';

interface PatientState {
  medicines: Medicine[];
  hydration: Hydration;
  appointments: Appointment[];
  activities: ActivityItem[];
}

export interface PatientDataCtxValue {
  provider: 'demo' | 'supabase';
  loading: boolean;
  error: string | null;
  refresh: () => void;
  /** Currently selected patient (demo fallback resolves to bundled demo data). */
  patient: Patient;
  /** Provider-level patient summary (id/name/age) for caregiver mapping. */
  patientSummary: { id: string; name: string; age?: number };
  patientCode: string | null;
  signInWithPatientCode: (code: string) => Promise<{ ok: boolean; error?: string }>;
  signOutPatient: () => void;
  medicines: Medicine[];
  hydration: Hydration;
  appointments: Appointment[];
  activities: ActivityItem[];
  nextAppointment: Appointment | null;
  medicinesDone: number;
  takeMedicine: (id: string) => void;
  remindLater: (id: string) => void;
  drinkWater: () => void;
  viewAppointment: (id: string) => void;
  /** Full medicine list incl. inactive (caregiver management). */
  allMedicines: Medicine[];
  addMedicine: (data: Omit<Medicine, 'id' | 'status'>) => void;
  updateMedicine: (id: string, patch: Partial<Medicine>) => void;
  removeMedicine: (id: string) => void;
  toggleMedicineActive: (id: string) => void;
  setHydrationTarget: (glasses: number) => void;
  addAppointment: (data: Omit<Appointment, 'id'>) => void;
  updateAppointment: (id: string, patch: Partial<Appointment>) => void;
  removeAppointment: (id: string) => void;
  gameResults: GameResult[];
  /** Called by GameRunner when a game session completes. */
  saveGameResult: (result: GameResult) => void;
}

const Ctx = createContext<PatientDataCtxValue | null>(null);

function readStored(): PatientState | null {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    return raw ? (JSON.parse(raw) as PatientState) : null;
  } catch {
    return null;
  }
}

function readGameResults(): GameResult[] {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(GAME_RESULTS_KEY) : null;
    return raw ? (JSON.parse(raw) as GameResult[]) : [];
  } catch {
    return [];
  }
}

function initial(): PatientState {
  const stored = readStored();
  if (!stored) {
    return {
      medicines: demoMedicines,
      hydration: { ...demoHydration },
      appointments: demoAppointments,
      activities: demoActivities,
    };
  }
  const today = todayKey();
  const hydration =
    stored.hydration && stored.hydration.dateKey === today
      ? stored.hydration
      : {
          currentGlasses: 0,
          targetGlasses: stored.hydration?.targetGlasses ?? demoHydration.targetGlasses,
          lastTakenAt: '',
          dateKey: today,
        };
  return {
    medicines: stored.medicines,
    hydration,
    appointments: stored.appointments,
    activities: stored.activities,
  };
}

export function PatientDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PatientState>(initial);
  const [gameResults, setGameResults] = useState<GameResult[]>(readGameResults);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [remote, setRemote] = useState<PatientData | null>(null);
  const [patientCode, setPatientCode] = useState<string | null>(() => {
    try {
      return window.localStorage.getItem(SELECTED_PATIENT_KEY);
    } catch {
      return null;
    }
  });
  const tapGuard = useRef<Partial<Record<'takeMedicine' | 'remindLater' | 'drinkWater' | 'viewAppointment', number>>>({});
  const viewedAppointments = useRef<Set<string>>(new Set());

  const guardOk = useCallback(
    (key: 'takeMedicine' | 'remindLater' | 'drinkWater' | 'viewAppointment'): boolean => {
      const now = Date.now();
      const last = tapGuard.current[key];
      if (last !== undefined && now - last < TAP_GUARD_MS) return false;
      tapGuard.current[key] = now;
      return true;
    },
    [],
  );

  const persist = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* shared tablets may block storage — app still works in-memory */
    }
  }, [state]);

  useEffect(() => {
    persist();
  }, [persist]);

  const refresh = useCallback(() => setReloadToken((n) => n + 1), []);

  // Resolve patient data through the active provider (Supabase when configured,
  // demo fallback otherwise). Runs once at startup and on explicit refresh().
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const provider = getProvider();
        let target: PatientData | null = null;
        if (patientCode) {
          target = await provider.getPatientData(patientCode).catch(() => null);
        }
        if (!target) {
          const assigned = await provider.getAssignedPatients().catch(() => [] as PatientData[]);
          target = assigned[0] ?? null;
        }
        if (cancelled) return;
        if (target) {
          setRemote(target);
          setState({
            medicines: target.medicines,
            hydration: target.hydration,
            appointments: target.appointments,
            activities: target.activities,
          });
          setGameResults(target.gameResults);
          try {
            window.localStorage.setItem(SELECTED_PATIENT_KEY, target.patient.id);
          } catch {
            /* ignore */
          }
          setLoadError(null);
        } else {
          setRemote(null);
          setLoadError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setRemote(null);
          setLoadError(e instanceof Error ? e.message : 'Could not load patient data.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadToken]);

  /** Best-effort remote write-through; local state is always updated first. */
  const mutateRemote = useCallback(
    async (fn: (patientId: string) => Promise<unknown>) => {
      if (!remote) return;
      try {
        await fn(remote.patient.id);
      } catch {
        /* offline/demo: local state already updated; ignore */
      }
    },
    [remote],
  );

  const signInWithPatientCode = useCallback(async (code: string) => {
    const clean = code.trim();
    if (!clean) return { ok: false, error: 'Please enter a patient code.' };
    try {
      const provider = getProvider();
      const target = await provider.getPatientData(clean);
      if (!target) return { ok: false, error: 'No patient found for that code.' };
      setRemote(target);
      setState({
        medicines: target.medicines,
        hydration: target.hydration,
        appointments: target.appointments,
        activities: target.activities,
      });
      setGameResults(target.gameResults);
      setPatientCode(target.patient.id);
      try {
        window.localStorage.setItem(SELECTED_PATIENT_KEY, target.patient.id);
      } catch {
        /* ignore */
      }
      setLoadError(null);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Sign-in failed.' };
    }
  }, []);

  const signOutPatient = useCallback(() => {
    setRemote(null);
    setPatientCode(null);
    try {
      window.localStorage.removeItem(SELECTED_PATIENT_KEY);
    } catch {
      /* ignore */
    }
    setState(initial());
    setGameResults([]);
  }, []);

  const takeMedicine = useCallback(
    (id: string) => {
      if (!guardOk('takeMedicine')) return;
      setState((prev) => {
        const med = prev.medicines.find((m) => m.id === id);
        if (!med || med.status === 'completed') return prev;
        const taken: Medicine = { ...med, status: 'completed', completedAt: new Date().toISOString() };
        const item = activityService.build(
          'medicine_completed',
          `Medicine taken — ${med.name}`,
          `ঔষধ খোৱা হ’ল — ${med.name}`,
          'medicine',
          `${med.time} • ${med.dosage}`,
          { titleKey: 'activity.medicineCompleted', patientId: demoPatient.id, meta: { medicineId: med.id, scheduledTime: med.time } },
        );
        return {
          ...prev,
          medicines: prev.medicines.map((m) => (m.id === id ? taken : m)),
          activities: activityService.prepend(prev.activities, item),
        };
      });
    },
    [guardOk],
  );

  const remindLater = useCallback(
    (id: string) => {
      if (!guardOk('remindLater')) return;
      setState((prev) => {
        const med = prev.medicines.find((m) => m.id === id);
        if (!med || med.status === 'completed' || med.status === 'deferred') return prev;
        const item = activityService.build(
          'medicine_deferred',
          `Reminder set — ${med.name}`,
          `মনত পেলোৱা বহাল — ${med.name}`,
          'medicine',
          `${med.time} • ${med.dosage}`,
          { titleKey: 'activity.medicineDeferred', patientId: demoPatient.id, meta: { medicineId: med.id, scheduledTime: med.time } },
        );
        return {
          ...prev,
          medicines: prev.medicines.map((m) => (m.id === id ? { ...m, status: 'deferred' } : m)),
          activities: activityService.prepend(prev.activities, item),
        };
      });
    },
    [guardOk],
  );

  const drinkWater = useCallback(() => {
    if (!guardOk('drinkWater')) return;
    setState((prev) => {
      if (prev.hydration.currentGlasses >= prev.hydration.targetGlasses) return prev;
      const count = prev.hydration.currentGlasses + 1;
      const item = activityService.build(
        'hydration_logged',
        `Water intake recorded — ${count} / ${prev.hydration.targetGlasses} glasses`,
        `পানী খোৱা লিপিবদ্ধ হ’ল — ${count} / ${prev.hydration.targetGlasses} গিলাচ`,
        'water',
        `${count} / ${prev.hydration.targetGlasses} glasses`,
        {
          titleKey: 'activity.hydrationLogged',
          patientId: demoPatient.id,
          meta: { count, target: prev.hydration.targetGlasses },
        },
      );
      return {
        ...prev,
        hydration: {
          ...prev.hydration,
          currentGlasses: count,
          lastTakenAt: nowDisplayTime(),
        },
        activities: activityService.prepend(prev.activities, item),
      };
    });
  }, [guardOk]);

  const viewAppointment = useCallback(
    (id: string) => {
      if (!guardOk('viewAppointment')) return;
      setState((prev) => {
        const appointment = prev.appointments.find((a) => a.id === id);
        if (!appointment) return prev;
        if (viewedAppointments.current.has(id)) return prev;
        viewedAppointments.current.add(id);
        const item = activityService.build(
          'appointment_viewed',
          `Appointment viewed — ${appointment.doctorName}`,
          `ভ্ৰমণ চোৱা হ’ল — ${appointment.doctorName}`,
          'appointment',
          `${appointment.date} • ${appointment.time}`,
          { titleKey: 'activity.appointmentViewed', patientId: demoPatient.id, meta: { appointmentId: id } },
        );
        return { ...prev, activities: activityService.prepend(prev.activities, item) };
      });
    },
    [guardOk],
  );

  // ---------- Caregiver management mutations (Phase 5) ----------

  const addMedicine = useCallback((data: Omit<Medicine, 'id' | 'status'>) => {
    setState((prev) => {
      const med: Medicine = { ...data, id: `m-${Date.now()}`, status: 'pending', active: data.active ?? true };
      const item = activityService.build(
        'appointment_reminder',
        `Medicine added — ${med.name}`,
        `ঔষধ যোগ কৰা হ’ল — ${med.name}`,
        'medicine',
        `${med.time} • ${med.dosage}`,
        { titleKey: 'activity.medicineAdded', patientId: demoPatient.id, meta: { medicineId: med.id } },
      );
      return { ...prev, medicines: [...prev.medicines, med], activities: activityService.prepend(prev.activities, item) };
    });
  }, []);

  const updateMedicine = useCallback((id: string, patch: Partial<Medicine>) => {
    setState((prev) => ({
      ...prev,
      medicines: prev.medicines.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }));
  }, []);

  const removeMedicine = useCallback((id: string) => {
    setState((prev) => ({ ...prev, medicines: prev.medicines.filter((m) => m.id !== id) }));
  }, []);

  const toggleMedicineActive = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      medicines: prev.medicines.map((m) => (m.id === id ? { ...m, active: !(m.active ?? true) } : m)),
    }));
  }, []);

  const setHydrationTarget = useCallback((glasses: number) => {
    const safe = Math.min(12, Math.max(4, Math.round(glasses)));
    setState((prev) => ({ ...prev, hydration: { ...prev.hydration, targetGlasses: safe } }));
  }, []);

  const addAppointment = useCallback((data: Omit<Appointment, 'id'>) => {
    setState((prev) => {
      const appt: Appointment = { ...data, id: `a-${Date.now()}` };
      const item = activityService.build(
        'appointment_reminder',
        `Appointment added — ${appt.doctorName}`,
        `ভ্ৰমণ যোগ কৰা হ’ল — ${appt.doctorName}`,
        'appointment',
        `${appt.date} • ${appt.time}`,
        { titleKey: 'activity.appointmentAdded', patientId: demoPatient.id, meta: { appointmentId: appt.id } },
      );
      return { ...prev, appointments: [...prev.appointments, appt], activities: activityService.prepend(prev.activities, item) };
    });
  }, []);

  const updateAppointment = useCallback((id: string, patch: Partial<Appointment>) => {
    setState((prev) => ({
      ...prev,
      appointments: prev.appointments.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));
  }, []);

  const removeAppointment = useCallback((id: string) => {
    setState((prev) => ({ ...prev, appointments: prev.appointments.filter((a) => a.id !== id) }));
  }, []);

  const saveGameResult = useCallback((result: GameResult) => {
    setGameResults((prev) => {
      const next = [result, ...prev].slice(0, 100);
      try {
        window.localStorage.setItem(GAME_RESULTS_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
    // Log a meaningful activity so Recent Activity reflects the completed game.
    setState((prev) => ({
      ...prev,
      activities: activityService.prepend(
        prev.activities,
        activityService.build(
          'cognitive_game_completed',
          'Game practice completed',
          'গেম অভ্যাস সম্পন্ন হ’ল',
          'game',
          `${result.gameCategory} • ${result.score} pts • ${result.accuracy}%`,
          {
            titleKey: 'activity.gameCompleted',
            patientId: result.patientId,
            meta: {
              gameId: result.gameId,
              category: result.gameCategory,
              score: result.score,
              accuracy: result.accuracy,
              difficulty: result.difficultyLevel,
              duration: result.duration,
            },
          },
        ),
      ),
    }));
  }, []);

  const value = useMemo<PatientDataCtxValue>(
    () => ({
      provider: appConfig.dataProvider,
      loading,
      error: loadError,
      refresh,
      patient: demoPatient,
      patientSummary: {
        id: demoPatient.id,
        name: demoPatient.name,
        age: demoPatient.age,
      },
      patientCode,
      signInWithPatientCode,
      signOutPatient,
      medicines: state.medicines,
      allMedicines: state.medicines,
      hydration: state.hydration,
      appointments: state.appointments,
      activities: state.activities,
      nextAppointment: pickNextAppointment(state.appointments),
      medicinesDone: state.medicines.filter((m) => m.status === 'completed').length,
      takeMedicine,
      remindLater,
      drinkWater,
      viewAppointment,
      addMedicine,
      updateMedicine,
      removeMedicine,
      toggleMedicineActive,
      setHydrationTarget,
      addAppointment,
      updateAppointment,
      removeAppointment,
      gameResults,
      saveGameResult,
    }),
    [
      state,
      gameResults,
      loading,
      loadError,
      refresh,
      patientCode,
      signInWithPatientCode,
      signOutPatient,
      takeMedicine,
      remindLater,
      drinkWater,
      viewAppointment,
      addMedicine,
      updateMedicine,
      removeMedicine,
      toggleMedicineActive,
      setHydrationTarget,
      addAppointment,
      updateAppointment,
      removeAppointment,
      saveGameResult,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePatientData(): PatientDataCtxValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('usePatientData must be used inside PatientDataProvider');
  return v;
}
function pickNextAppointment(list: Appointment[]): Appointment | null {
  return list.find((a) => a.status === 'today' || a.status === 'upcoming') ?? null;
}