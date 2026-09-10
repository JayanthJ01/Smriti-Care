import type { GameCategory, GameResult } from '../../types';

/**
 * Adaptive difficulty — shared types (Phase 4B).
 *
 * This is a PROTOTYPE personalization system, NOT a clinical assessment.
 * "Declining" only means recent game performance decreased — it never
 * implies any health condition.
 */

/** 1 = Easy, 2 = Medium, 3 = Hard, 4 = Advanced. */
export type DifficultyLevel = 1 | 2 | 3 | 4;

export type PerformanceTrend = 'improving' | 'stable' | 'declining' | 'insufficient_data';

export type NextAction = 'increase' | 'maintain' | 'decrease';

/** Deterministic, per-session performance measurement (0–100). */
export interface PerformanceScore {
  /** 0–100, see docs/adaptive-difficulty.md for the formula. */
  performanceScore: number;
  /** Session accuracy in percent (0–100). */
  accuracy: number;
  /** Average mistakes per round. */
  mistakesPerRound: number;
  /** Whether the session reached `completed` status. */
  completed: boolean;
}

export interface DifficultyRecommendation {
  recommendedDifficulty: DifficultyLevel;
  currentDifficulty: DifficultyLevel;
  /** Internal explanation (never shown verbatim to the patient). */
  reason: string;
  /** Confidence in the RULE-BASED recommendation only (0–1). Not medically meaningful. */
  confidence: number;
  /** Average recent performance score (0–100). */
  performanceScore: number;
  trend: PerformanceTrend;
  nextAction: NextAction;
}

/**
 * Engine interface — rule-based today; a future ML implementation can be
 * swapped in behind this same contract without touching the UI.
 */
export interface AdaptiveEngine {
  /** Deterministic 0–100 performance measurement for one session. */
  calculatePerformance(result: GameResult): PerformanceScore;
  /** improving | stable | declining | insufficient_data */
  calculateTrend(results: GameResult[]): PerformanceTrend;
  /** Difficulty for the NEXT session of `category` (never mid-game). */
  recommendDifficulty(
    category: GameCategory,
    currentDifficulty: DifficultyLevel,
    results: GameResult[],
  ): DifficultyRecommendation;
  /** Fold a fresh result into the (capped) history. Pure. */
  updateFromResult(history: GameResult[], result: GameResult): GameResult[];
}