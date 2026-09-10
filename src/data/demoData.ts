import type {
  ActivityItem,
  Appointment,
  CaregiverSummary,
  CognitiveActivity,
  Hydration,
  Medicine,
  Patient,
} from '../types';
import { todayKey } from '../utils/datetime';

export const demoPatient: Patient = {
  id: 'p-malati',
  name: 'Malati Devi',
  nameAssamese: 'মালতী দেৱী',
  age: 72,
  village: 'Nalbari, Assam',
  villageAssamese: 'নলবাৰী, অসম',
  language: 'as',
  greetingNote: 'Time for morning medicine and a glass of warm water.',
  greetingNoteAssamese: 'পুৱাৰ ঔষধ আৰু এগিলাচ কুহুমীয়া পানীৰ সময়।',
  avatarInitials: 'MD',
};

export const demoPatients: Patient[] = [
  demoPatient,
  {
    id: 'p-haren',
    name: 'Haren Das',
    nameAssamese: 'হৰেণ দাস',
    age: 75,
    village: 'Tezpur, Assam',
    villageAssamese: 'তেজপুৰ, অসম',
    language: 'as',
    greetingNote: 'Afternoon walk and evening medicine remain.',
    greetingNoteAssamese: 'আবেলি খোজ আৰু সন্ধিয়াৰ ঔষধ বাকী।',
    avatarInitials: 'HD',
  },
  {
    id: 'p-bina',
    name: 'Bina Kalita',
    nameAssamese: 'বীণা কলিতা',
    age: 68,
    village: 'Jorhat, Assam',
    villageAssamese: 'যোৰহাট, অসম',
    language: 'en',
    greetingNote: 'Hydration is going well today.',
    greetingNoteAssamese: 'আজি পানী ভালকৈ খোৱা হৈছে।',
    avatarInitials: 'BK',
  },
];

export const demoMedicines: Medicine[] = [
  {
    id: 'm1',
    name: 'Morning Heart Tablet',
    dosage: '1 tablet after breakfast',
    time: '8:00 AM',
    periodLabel: 'Morning',
    periodLabelAssamese: 'পুৱা',
    status: 'pending',
    note: 'With warm water',
  },
  {
    id: 'm2',
    name: 'Vitamin D3',
    dosage: '1 capsule',
    time: '1:00 PM',
    periodLabel: 'Afternoon',
    periodLabelAssamese: 'দুপৰীয়া',
    status: 'completed',
  },
  {
    id: 'm3',
    name: 'Evening Memory Support',
    dosage: '1 tablet after dinner',
    time: '8:30 PM',
    periodLabel: 'Night',
    periodLabelAssamese: 'নিশা',
    status: 'pending',
  },
];

export const demoHydration: Hydration = {
  currentGlasses: 6,
  targetGlasses: 8,
  lastTakenAt: '10:30 AM',
  dateKey: todayKey(),
};

export const demoAppointments: Appointment[] = [
  {
    id: 'a1',
    doctorName: 'Dr. Pranab Saikia',
    specialty: 'Memory Care Physician',
    date: 'Thu, 11 Sep',
    time: '10:30 AM',
    location: 'Nalbari Civil Hospital',
    note: 'Bring medicine strip and last visit slip.',
    status: 'today',
  },
  {
    id: 'a2',
    doctorName: 'Dr. Mitali Baruah',
    specialty: 'General Physician',
    date: 'Mon, 16 Sep',
    time: '5:00 PM',
    location: 'Guwahati Care Clinic',
    note: 'Routine blood pressure review.',
    status: 'upcoming',
  },
];

export const demoActivities: ActivityItem[] = [
  {
    id: 'ac1',
    type: 'medicine_completed',
    title: 'Morning medicine taken',
    titleAssamese: 'পুৱাৰ ঔষধ খোৱা হ’ল',
    time: '8:10 AM',
    timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    kind: 'medicine',
    detail: 'Vitamin + heart tablet',
    patientId: demoPatient.id,
  },
  {
    id: 'ac2',
    type: 'hydration_logged',
    title: 'Drank 2 glasses of water',
    titleAssamese: '২ গিলাচ পানী খালে',
    time: '9:40 AM',
    timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    kind: 'water',
    detail: 'Daily target half reached',
    patientId: demoPatient.id,
  },
  {
    id: 'ac3',
    type: 'cognitive_game_completed',
    title: 'Memory warm-up played',
    titleAssamese: 'স্মৃতি খেল খেলিলে',
    time: 'Yesterday',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    kind: 'game',
    detail: '6 min gentle session',
    patientId: demoPatient.id,
  },
];

export const cognitiveActivities: CognitiveActivity[] = [
  {
    id: 'memory',
    titleKey: 'cognitive.memory',
    descriptionKey: 'cognitive.memoryDesc',
    icon: 'memory',
    accent: 'amber',
    estimatedMinutes: 6,
  },
  {
    id: 'attention',
    titleKey: 'cognitive.attention',
    descriptionKey: 'cognitive.attentionDesc',
    icon: 'attention',
    accent: 'pine',
    estimatedMinutes: 5,
  },
  {
    id: 'routine',
    titleKey: 'cognitive.routine',
    descriptionKey: 'cognitive.routineDesc',
    icon: 'routine',
    accent: 'leaf',
    estimatedMinutes: 7,
  },
];

export const caregiverSummary: CaregiverSummary = {
  totalPatients: 3,
  medicinesToday: { done: 4, total: 7 },
  hydrationAvg: 62,
  appointmentsToday: 1,
  activeStreakDays: 12,
};
