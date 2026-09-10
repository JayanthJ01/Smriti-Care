import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProvider } from '../services/data/factory';
import { usePatientData, type PatientDataCtxValue } from './PatientDataContext';
import type { PatientData } from '../services/data/types';
import type { Patient } from '../types';

export type { PatientData };

interface CaregiverCtxValue {
  patients: Patient[];
  selectedPatientId: string;
  selectPatient: (id: string) => void;
  selectedPatient: Patient;
  /** Re-exported patient data actions (shared with Patient Home). */
  data: PatientDataCtxValue;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  /** Clears caregiver session and returns to welcome. */
  signOut: () => void;
}

const Ctx = createContext<CaregiverCtxValue | null>(null);

function toEntity(p: { id: string; name: string; age?: number }): Patient {
  return {
    id: p.id,
    name: p.name,
    nameAssamese: '',
    age: p.age ?? 0,
    village: '',
    villageAssamese: '',
    language: 'en',
    greetingNote: '',
    greetingNoteAssamese: '',
    avatarInitials: (p.name || 'P').split(/\s+/).map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || 'P',
  };
}

export function CaregiverProvider({ children }: { children: ReactNode }) {
  const data = usePatientData();
  const navigate = useNavigate();
  const [assigned, setAssigned] = useState<PatientData[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const refresh = useCallback(() => setReloadToken((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const provider = getProvider();
        const list = await provider.getAssignedPatients();
        if (cancelled) return;
        setAssigned(list);
        setError(null);
        setSelectedPatientId((prev) => {
          if (prev && list.some((p) => p.patient.id === prev)) return prev;
          return list[0]?.patient.id ?? '';
        });
      } catch (e) {
        if (!cancelled) {
          setAssigned([]);
          setError(e instanceof Error ? e.message : 'Could not load patients.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const signOut = () => {
    setSelectedPatientId('');
    navigate('/welcome');
  };

  const value = useMemo<CaregiverCtxValue>(() => {
    const entities = assigned.map((p) => toEntity(p.patient));
    const selectedPatient =
      entities.find((p) => p.id === selectedPatientId) ?? entities[0] ?? toEntity(data.patientSummary);
    return {
      patients: entities,
      selectedPatientId: selectedPatient.id,
      selectPatient: setSelectedPatientId,
      selectedPatient,
      data,
      loading,
      error,
      refresh,
      signOut,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assigned, selectedPatientId, data, loading, error, refresh]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCaregiver(): CaregiverCtxValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useCaregiver must be used inside CaregiverProvider');
  return v;
}
