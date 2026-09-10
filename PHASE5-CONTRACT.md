# Phase 5 Contract (2026-09-09)

## Data layer — COMPLETE
PatientDataContext exposes: patients[], selectedPatientId, setSelectedPatientId,
medicines[], hydration, appointments[], activities[], gameResults[],
addMedicine(), updateMedicine(), removeMedicine(), toggleMedicine(),
setHydrationTarget(), addAppointment(), updateAppointment(), removeAppointment(),
saveGameResult(), takeMedicine(), remindLater(), drinkWater(), viewAppointment().

## Existing caregiver components (src/components/caregiver/)
- cgShared.tsx — CgCard, CgStat, CgBtn, CgBtnSm, CgField, CgLabel, EmptyBox
- MedicinesPanel.tsx — export default MedicinesPanel
- HydrationPanel.tsx — export default HydrationPanel
- ActivityPanel.tsx — export default ActivityPanel

## Pages
- src/pages/CaregiverPage/CaregiverPage.tsx — main shell, nav, section switch
- src/pages/CaregiverPage/RecentPanel.tsx — legacy (to remove)
- src/pages/CaregiverPage/UpcomingPanel.tsx — legacy (to remove)

## MISSING (write now)
1. src/components/caregiver/AppointmentsPanel.tsx
2. src/components/caregiver/CognitivePanel.tsx
3. src/components/caregiver/FamilyPanel.tsx
4. src/components/caregiver/PatientAppPanel.tsx
5. src/components/caregiver/DashboardPanel.tsx
6. Rewrite src/pages/CaregiverPage/CaregiverPage.tsx
7. Add cg.* i18n keys to en.ts + as.ts
8. npm test, tsc --noEmit, npm run build

## Conventions
- Import shared helpers from './cgShared'
- useLanguage(), usePatientData()
- Difficulty: 1 Easy, 2 Medium, 3 Hard, 4 Adaptive
- Categories: memory, attention, routine-recognition
- Adaptive engine: calculateGamePerformance(), calculateAverageAccuracy(),
  calculateTrend(), groupPerformanceByCategory(), recommendDifficulty()
