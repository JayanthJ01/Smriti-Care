# Phase 5 working contract (data layer facts — do not delete until Phase 5 done)

## types (src/types/index.ts)
- Medicine: {id, name, dosage, time, periodLabel, periodLabelAssamese, status: 'pending'|'completed'|'missed'|'deferred', note?, completedAt?}  → ADD `active: boolean`
- Appointment: {id, doctorName, specialty, date, time, location, note, status: 'upcoming'|'today'|'completed'|'cancelled'}
- ActivityItem: {id, type: ActivityType, title, titleAssamese, titleKey?, time, kind: 'medicine'|'water'|'game'|'appointment'|'checkin', detail, timestamp?, patientId?, meta?}
- GameResult: {id, gameId, patientId, sessionId, gameCategory: 'memory'|'attention'|'routine-recognition', score, accuracy(0-100), correctAnswers, incorrectAnswers, mistakes, responseTimeAverage, duration, difficultyLevel: string('Easy'...), roundsCompleted, completionStatus: 'completed'|'abandoned', startedAt, completedAt, metadata}
- GameCategory = 'memory' | 'attention' | 'routine-recognition'

## PatientDataContext (usePatientData)
Existing: provider, patient, medicines, hydration{currentGlasses,targetGlasses,lastTakenAt,dateKey?}, appointments, activities, nextAppointment, medicinesDone, takeMedicine(id), remindLater(id), drinkWater(), viewAppointment(id), gameResults, saveGameResult(r).
PHASE 5 TO ADD: addMedicine(data), updateMedicine(id,patch), removeMedicine(id), toggleMedicineActive(id), setHydrationTarget(n), addAppointment(data), updateAppointment(id,patch), removeAppointment(id).
- activityService.build(type, title, titleAssamese, kind, detail, {titleKey, patientId, meta}) → ActivityItem; activityService.prepend(list, item).
- datetime: todayKey(), nowDisplayTime(), nowIso(), isPastTime(), splitTimeLabel().
- Persist: STORAGE_KEY 'smriti-patient-data-v1', GAME_RESULTS_KEY 'smriti-game-results-v1'.

## adaptive engine (src/services/adaptive/adaptiveEngine.ts exports)
calculateGamePerformance(result) → {performanceScore...}; calculateAverageAccuracy(list); calculateRecentPerformance(list); calculateTrend(results) → 'improving'|'stable'|'declining'|'insufficient_data'; groupPerformanceByCategory(results); recommendDifficulty(results, category, currentLevel) → {recommendedDifficulty, reason, confidence, performanceScore, trend, nextAction}. Difficulty levels 1-4 = Easy/Medium/Hard/Advanced (adaptiveConfig has labels).
