import type { CaregiverSession, DataProvider, PatientData } from '../types';
import type { Patient, Medicine, Hydration, Appointment, ActivityItem, GameResult } from '../../../types';
import {
  demoActivities,
  demoAppointments,
  demoHydration,
  demoMedicines,
  demoPatient,
  demoPatients,
} from '../../../data/demoData';
import { todayKey, nowIso } from '../../../utils/datetime';

const LS_KEY = 'smriti_demo_v1';

type PersistShape = {
  medicines: Record<string, Medicine[]>;
  hydration: Record<string, Hydration>;
  appointments: Record<string, Appointment[]>;
  activities: Record<string, ActivityItem[]>;
  gameResults: Record<string, GameResult[]>;
  profiles: Array<{ id: string; name: string; email: string }>;
  links: Array<{ caregiverId: string; patientId: string }>;
};

function seed(): PersistShape {
  const key = todayKey();
  const by: PersistShape = {
    medicines: {},
    hydration: {},
    appointments: {},
    activities: {},
    gameResults: {},
    profiles: [{ id: 'cg-demo', name: 'Demo Caregiver', email: 'caregiver@example.com' }],
    links: [],
  };
  for (const p of demoPatients) {
    const first = p.id === demoPatient.id;
    by.medicines[p.id] = first ? demoMedicines.map((m) => ({ ...m })) : [];
    by.hydration[p.id] = first
      ? { ...demoHydration }
      : { currentGlasses: 0, targetGlasses: 8, lastTakenAt: '', dateKey: key };
    by.appointments[p.id] = first ? demoAppointments.map((a) => ({ ...a })) : [];
    by.activities[p.id] = first ? demoActivities.map((a) => ({ ...a })) : [];
    by.gameResults[p.id] = [];
    by.links.push({ caregiverId: 'cg-demo', patientId: p.id });
  }
  return by;
}

function load(): PersistShape {
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return seed();
    return { ...seed(), ...(JSON.parse(raw) as Partial<PersistShape>) };
  } catch {
    return seed();
  }
}

function uid(prefix: string): string {
  return prefix + '-' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
}

export class DemoDataProvider implements DataProvider {
  private store: PersistShape = load();

  private save(): void {
    try {
      window.localStorage.setItem(LS_KEY, JSON.stringify(this.store));
    } catch {
      /* ignore */
    }
  }

  async getCaregiverSession(): Promise<CaregiverSession | null> {
    return this.store.profiles[0] ?? null;
  }

  async getCaregiverProfiles() {
    return this.store.profiles;
  }

  async getCaregiverPatientLinks() {
    return this.store.links;
  }

  async getAssignedPatients(): Promise<PatientData[]> {
    const links = await this.getCaregiverPatientLinks();
    const out: PatientData[] = [];
    for (const l of links) {
      const d = await this.getPatientData(l.patientId);
      if (d) out.push(d);
    }
    return out;
  }

  async getPatientData(patientId: string): Promise<PatientData | null> {
    const patient: Patient | undefined = demoPatients.find((p) => p.id === patientId);
    if (!patient) return null;
    const key = todayKey();
    const h = this.store.hydration[patientId] ?? { ...demoHydration };
    return {
      patient,
      medicines: this.store.medicines[patientId] ?? [],
      hydration: { ...h, dateKey: h.dateKey ?? key },
      appointments: this.store.appointments[patientId] ?? [],
      activities: this.store.activities[patientId] ?? [],
      gameResults: this.store.gameResults[patientId] ?? [],
      caregivers: this.store.links.filter((l) => l.patientId === patientId).map((l) => l.caregiverId),
    };
  }

  async getMedicines(patientId: string): Promise<Medicine[]> {
    return this.store.medicines[patientId] ?? [];
  }

  async createMedicine(patientId: string, medicine: Medicine) {
    const list = this.store.medicines[patientId] ?? [];
    list.push({ ...medicine, id: medicine.id || uid('m') });
    this.store.medicines[patientId] = list;
    this.save();
    return { ok: true };
  }

  async updateMedicine(patientId: string, id: string, medicine: Medicine) {
    const list = this.store.medicines[patientId] ?? [];
    this.store.medicines[patientId] = list.map((m) => (m.id === id ? { ...medicine, id } : m));
    this.save();
    return { ok: true };
  }

  async removeMedicine(patientId: string, id: string) {
    this.store.medicines[patientId] = (this.store.medicines[patientId] ?? []).filter((m) => m.id !== id);
    this.save();
    return { ok: true };
  }

  async getHydration(patientId: string, dateKey: string): Promise<Hydration | null> {
    const h = this.store.hydration[patientId];
    if (!h || (h.dateKey && h.dateKey !== dateKey)) return null;
    return { ...h, dateKey };
  }

  async upsertHydration(patientId: string, hydration: Hydration) {
    this.store.hydration[patientId] = { ...hydration };
    this.save();
    return { ok: true };
  }

  async setHydrationTarget(patientId: string, dateKey: string, targetGlasses: number) {
    const h = (await this.getHydration(patientId, dateKey)) ?? { currentGlasses: 0, targetGlasses: 8, lastTakenAt: '', dateKey };
    this.store.hydration[patientId] = { ...h, targetGlasses, dateKey };
    this.save();
    return { ok: true };
  }

  async getAppointments(patientId: string): Promise<Appointment[]> {
    return this.store.appointments[patientId] ?? [];
  }

  async createAppointment(patientId: string, appointment: Appointment) {
    const list = this.store.appointments[patientId] ?? [];
    list.push({ ...appointment, id: appointment.id || uid('a') });
    this.store.appointments[patientId] = list;
    this.save();
    return { ok: true };
  }

  async updateAppointment(patientId: string, id: string, appointment: Appointment) {
    const list = this.store.appointments[patientId] ?? [];
    this.store.appointments[patientId] = list.map((a) => (a.id === id ? { ...appointment, id } : a));
    this.save();
    return { ok: true };
  }

  async removeAppointment(patientId: string, id: string) {
    this.store.appointments[patientId] = (this.store.appointments[patientId] ?? []).filter((a) => a.id !== id);
    this.save();
    return { ok: true };
  }

  async getActivities(patientId: string): Promise<ActivityItem[]> {
    return this.store.activities[patientId] ?? [];
  }

  async createActivity(patientId: string, activity: ActivityItem) {
    const list = this.store.activities[patientId] ?? [];
    list.unshift({ ...activity, id: activity.id || uid('act') });
    this.store.activities[patientId] = list.slice(0, 50);
    this.save();
    return { ok: true };
  }

  async getGameResults(patientId: string): Promise<GameResult[]> {
    return this.store.gameResults[patientId] ?? [];
  }

  async saveGameResult(patientId: string, result: GameResult) {
    const list = this.store.gameResults[patientId] ?? [];
    list.unshift({ ...result, id: result.id || uid('g') });
    this.store.gameResults[patientId] = list.slice(0, 100);
    this.save();
    return { ok: true };
  }

  async removeGameResult(patientId: string, id: string) {
    this.store.gameResults[patientId] = (this.store.gameResults[patientId] ?? []).filter((g) => g.id !== id);
    this.save();
    return { ok: true };
  }

  async markMedicineTaken(patientId: string, medicineId: string, stamp = nowIso()) {
    const list = this.store.medicines[patientId] ?? [];
    this.store.medicines[patientId] = list.map((m) => (m.id === medicineId ? { ...m, status: 'completed', completedAt: stamp } : m));
    await this.createActivity(patientId, {
      id: uid('act'), type: 'medicine_completed', title: 'Medicine taken', titleAssamese: 'ঔষধ খোৱা হ’ল',
      time: stamp, timestamp: stamp, kind: 'medicine', detail: medicineId, patientId,
    });
    return { ok: true };
  }

  async markMedicineDeferred(patientId: string, medicineId: string, stamp = nowIso()) {
    const list = this.store.medicines[patientId] ?? [];
    this.store.medicines[patientId] = list.map((m) => (m.id === medicineId ? { ...m, status: 'deferred' } : m));
    await this.createActivity(patientId, {
      id: uid('act'), type: 'medicine_deferred', title: 'Medicine deferred', titleAssamese: 'ঔষধ পিছলৈ',
      time: stamp, timestamp: stamp, kind: 'medicine', detail: medicineId, patientId,
    });
    return { ok: true };
  }

  async logHydrationDrink(patientId: string, dateKey: string, stamp = nowIso()) {
    const h = (await this.getHydration(patientId, dateKey)) ?? { currentGlasses: 0, targetGlasses: 8, lastTakenAt: '', dateKey };
    this.store.hydration[patientId] = { ...h, currentGlasses: h.currentGlasses + 1, lastTakenAt: stamp, dateKey };
    this.save();
    return { ok: true };
  }

  async markAppointmentViewed(patientId: string, appointmentId: string, stamp = nowIso()) {
    await this.createActivity(patientId, {
      id: uid('act'), type: 'appointment_viewed', title: 'Appointment viewed', titleAssamese: 'এপইণ্টমেণ্ট',
      time: stamp, timestamp: stamp, kind: 'appointment', detail: appointmentId, patientId,
    });
    return { ok: true };
  }
}
