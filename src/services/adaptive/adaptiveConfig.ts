import type { DifficultyLevel } from './types';

/**
 * Centralized adaptive thresholds (Phase 4B).
 * All numbers live here so tuning never touches engine logic.
 *
 * Design decision — response time is deliberately EXCLUDED from the
 * performance score and from strong/weak classification. Accuracy and
 * consistency dominate; being slower must never punish an elderly user.
 * Response time stays available in GameResult for future supporting use.
 */
export const ADAPTIVE_CONFIG = {
  /** Difficulty bounds — never below Easy, never above Advanced. */
  minLevel: 1,
  maxLevel: 4,

  /** A session is STRONG when accuracy >= 90 and mistakes/round <= 1. */
  strongAccuracy: 90,
  strongMistakesPerRound: 1,
  /** A session is WEAK when accuracy < 65 or mistakes/round >= 2. */
  weakAccuracy: 65,
  weakMistakesPerRound: 2,

  /** Consistency requirement — never adapt from a single lucky/bad result. */
  strongSessionsRequired: 2,
  weakSessionsRequired: 2,

  /** Fewer completed sessions than this → insufficient_data (stay put). */
  minCompletedSessions: 2,
  /** This many most-recent sessions abandoned/not completed → ease off. */
  recentAbandonedForDecrease: 2,

  /** Trend: recent-vs-previous average gap (accuracy points). */
  trendDeltaPoints: 10,

  /** Performance score shown in the recommendation = average of newest N. */
  recentPerformanceWindow: 3,

  /** History retained by updateFromResult. */
  historyCap: 50,
} as const;

export const LEVEL_NAMES: Record<DifficultyLevel, string> = {
  1: 'Easy',
  2: 'Medium',
  3: 'Hard',
  4: 'Advanced',
};

/** Clamp any number into the valid 1–4 difficulty range. */
export function clampLevel(level: number): DifficultyLevel {
  return Math.min(4, Math.max(1, Math.round(level))) as DifficultyLevel;
}