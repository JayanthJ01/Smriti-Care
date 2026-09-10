import type { GameCategory, GameResult, GameRoundResult, GameSession } from '../../types';
import { nowIso } from '../../utils/datetime';

let seq = 0;

/** Create a fresh game session (Phase 4A: difficulty is always Easy). */
export function createGameSession(
  gameId: string,
  category: GameCategory,
  patientId: string,
  difficultyLevel: string,
  totalRounds: number,
): GameSession {
  seq += 1;
  return {
    gameId,
    gameCategory: category,
    patientId,
    sessionId: `gs-${Date.now()}-${seq}`,
    currentRound: 0,
    totalRounds,
    score: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    mistakes: 0,
    responseTimes: [],
    startedAt: nowIso(),
    difficultyLevel,
    completionStatus: 'completed',
  };
}

/** Build the final GameResult from the session + per-round outcomes. */
export function buildGameResult(
  session: GameSession,
  rounds: GameRoundResult[],
  metadata: Record<string, string | number | boolean | null> = {},
  completionStatus: 'completed' | 'abandoned' = 'completed',
): GameResult {
  const correct = rounds.filter((r) => r.correct).length;
  const mistakes = rounds.reduce((sum, r) => sum + r.mistakes, 0);
  const total = rounds.length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const avgTime =
    total > 0 ? Math.round(rounds.reduce((s, r) => s + r.responseTimeMs, 0) / total) : 0;
  const duration = Math.max(0, Date.now() - new Date(session.startedAt).getTime());
  const score = Math.max(0, correct * 10 + Math.max(0, total - mistakes) * 5);
  return {
    id: `gr-${session.sessionId}`,
    gameId: session.gameId,
    patientId: session.patientId,
    sessionId: session.sessionId,
    gameCategory: session.gameCategory,
    score,
    accuracy,
    correctAnswers: correct,
    incorrectAnswers: mistakes,
    mistakes,
    responseTimeAverage: avgTime,
    duration,
    difficultyLevel: session.difficultyLevel,
    roundsCompleted: total,
    completionStatus,
    startedAt: session.startedAt,
    completedAt: nowIso(),
    metadata: { ...metadata, difficulty: session.difficultyLevel },
  };
}

/** Simple patient-friendly duration (m:ss). */
export function formatGameDuration(ms: number): string {
  const totalSec = Math.round(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${String(sec).padStart(2, '0')}`;
}
