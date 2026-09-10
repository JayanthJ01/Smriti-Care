import type { GameCategory, GameResult } from '../../types';
import { ADAPTIVE_CONFIG, LEVEL_NAMES, clampLevel } from './adaptiveConfig';
import type {
  AdaptiveEngine,
  DifficultyLevel,
  DifficultyRecommendation,
  NextAction,
  PerformanceScore,
  PerformanceTrend,
} from './types';

/**
 * RuleBasedAdaptiveEngine (Phase 4B) — deterministic, local, lightweight.
 *
 * Design decisions:
 * - Accuracy and consistency dominate; response time is deliberately EXCLUDED
 *   (documented in adaptiveConfig + docs/adaptive-difficulty.md) so an elderly
 *   user is never punished simply for being slower.
 * - Difficulty NEVER changes because of one result: consecutive strong/weak
 *   sessions are required (ADAPTIVE_CONFIG).
 * - This is a game personalization system, NOT a clinical assessment.
 *   "Declining" only means recent game performance decreased.
 */

/** Newest first, safest ordering for all adaptive calculations. */
function newestFirst(results: GameResult[]): GameResult[] {
  return [...results].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  );
}

export function completedOnly(results: GameResult[]): GameResult[] {
  return newestFirst(results).filter((r) => r.completionStatus === 'completed');
}

/**
 * Performance score (0–100) for ONE session — pure and testable.
 *
 * Formula (documented in docs/adaptive-difficulty.md):
 *   performanceScore = 0.6 * accuracy
 *                    + 0.25 * mistakeScore   (100 − 50 × mistakes/round, floored at 0)
 *                    + 0.15 * completionScore (100 completed, 40 otherwise)
 * Response time is intentionally excluded.
 */
export function calculateGamePerformance(result: GameResult): PerformanceScore {
  const rounds = Math.max(1, result.roundsCompleted);
  const mistakesPerRound = result.mistakes / rounds;
  const completed = result.completionStatus === 'completed';
  const mistakeScore = Math.max(0, 100 - mistakesPerRound * 50);
  const completionScore = completed ? 100 : 40;
  const performanceScore = Math.round(
    result.accuracy * 0.6 + mistakeScore * 0.25 + completionScore * 0.15,
  );
  return { performanceScore, accuracy: result.accuracy, mistakesPerRound, completed };
}

export function isStrongSession(p: PerformanceScore): boolean {
  return p.accuracy >= ADAPTIVE_CONFIG.strongAccuracy && p.mistakesPerRound <= ADAPTIVE_CONFIG.strongMistakesPerRound;
}

export function isWeakSession(p: PerformanceScore): boolean {
  return p.accuracy < ADAPTIVE_CONFIG.weakAccuracy || p.mistakesPerRound >= ADAPTIVE_CONFIG.weakMistakesPerRound;
}

/** Average accuracy (0–100) across sessions. Pure. */
export function calculateAverageAccuracy(results: GameResult[]): number {
  if (results.length === 0) return 0;
  return Math.round(results.reduce((sum, r) => sum + r.accuracy, 0) / results.length);
}

/** Average performance score of the newest `window` completed sessions. Pure. */
export function calculateRecentPerformance(results: GameResult[], window = ADAPTIVE_CONFIG.recentPerformanceWindow): number {
  const completed = completedOnly(results).slice(0, window);
  if (completed.length === 0) return 0;
  const scores = completed.map(calculateGamePerformance);
  return Math.round(scores.reduce((sum, p) => sum + p.performanceScore, 0) / scores.length);
}

/**
 * Trend from recent vs previous completed sessions (simple, deterministic):
 * recentAvg − previousAvg ≥ +10 → improving, ≤ −10 → declining, else stable.
 * "Declining" means ONLY that recent game performance decreased.
 */
export function calculateTrend(results: GameResult[]): PerformanceTrend {
  const completed = completedOnly(results);
  if (completed.length < ADAPTIVE_CONFIG.minCompletedSessions) return 'insufficient_data';
  const split = Math.ceil(completed.length / 2);
  const recent = completed.slice(0, split);
  const previous = completed.slice(split);
  if (previous.length === 0) return 'insufficient_data';
  const delta = calculateAverageAccuracy(recent) - calculateAverageAccuracy(previous);
  if (delta >= ADAPTIVE_CONFIG.trendDeltaPoints) return 'improving';
  if (delta <= -ADAPTIVE_CONFIG.trendDeltaPoints) return 'declining';
  return 'stable';
}

/** Group results by game category (caregiver analytics prep — Phase 5/6). */
export function groupPerformanceByCategory(results: GameResult[]): Record<GameCategory, GameResult[]> {
  return results.reduce(
    (acc, result) => {
      (acc[result.gameCategory] ??= []).push(result);
      return acc;
    },
    {} as Record<GameCategory, GameResult[]>,
  );
}

/**
 * Difficulty recommendation for the NEXT session of `category`.
 * Never changes difficulty mid-game — callers launch a new session with it.
 */
export function calculateDifficultyRecommendation(
  currentDifficulty: DifficultyLevel,
  results: GameResult[],
): DifficultyRecommendation {
  const { minLevel, maxLevel, strongSessionsRequired, weakSessionsRequired } = ADAPTIVE_CONFIG;
  const completed = completedOnly(results);
  const perf = completed.map(calculateGamePerformance);
  const recentScore = calculateRecentPerformance(results);
  const insufficient: DifficultyRecommendation = {
    recommendedDifficulty: currentDifficulty,
    currentDifficulty,
    reason: 'Not enough recent performance data',
    confidence: 0.25,
    performanceScore: recentScore,
    trend: 'insufficient_data',
    nextAction: 'maintain',
  };

  if (completed.length < ADAPTIVE_CONFIG.minCompletedSessions) {
    // Repeated unfinished sessions alone can ease the challenge down.
    const allResults = newestFirst(results);
    const recent = allResults.slice(0, ADAPTIVE_CONFIG.recentAbandonedForDecrease);
    const allAbandoned =
      recent.length >= ADAPTIVE_CONFIG.recentAbandonedForDecrease &&
      recent.every((r) => r.completionStatus !== 'completed');
    if (allAbandoned && currentDifficulty > minLevel) {
      return {
        recommendedDifficulty: clampLevel(currentDifficulty - 1),
        currentDifficulty,
        reason: 'Recent sessions were left unfinished — easing off',
        confidence: 0.35,
        performanceScore: recentScore,
        trend: 'insufficient_data',
        nextAction: 'decrease',
      };
    }
    return insufficient;
  }

  // Consecutive strong/weak evidence counted from the NEWEST session.
  let strong = 0;
  while (strong < perf.length && isStrongSession(perf[strong])) strong += 1;
  let weak = 0;
  while (weak < perf.length && isWeakSession(perf[weak])) weak += 1;

  let nextAction: NextAction = 'maintain';
  let reason = 'Mixed recent performance — keeping the current challenge';
  if (weak >= weakSessionsRequired) {
    if (currentDifficulty <= minLevel) {
      reason = 'At minimum difficulty — staying at Easy';
    } else {
      nextAction = 'decrease';
      reason = 'Consistently weak performance';
    }
  } else if (strong >= strongSessionsRequired) {
    if (currentDifficulty >= maxLevel) {
      reason = 'At maximum difficulty — staying at Advanced';
    } else {
      nextAction = 'increase';
      reason = 'Consistently strong performance';
    }
  }

  // Confidence in the RULE-BASED recommendation only (never medical).
  let confidence = Math.min(0.9, 0.4 + completed.length * 0.1);
  if (nextAction === 'maintain' && strong === 0 && weak === 0) confidence = Math.max(0.3, confidence - 0.15);

  return {
    recommendedDifficulty: clampLevel(
      currentDifficulty + (nextAction === 'increase' ? 1 : nextAction === 'decrease' ? -1 : 0),
    ),
    currentDifficulty,
    reason,
    confidence: Math.round(confidence * 100) / 100,
    performanceScore: recentScore,
    trend: calculateTrend(results),
    nextAction,
  };
}

/** Reverse lookup of LEVEL_NAMES ('Easy' → 1 …). */
export function levelFromName(name: string): DifficultyLevel {
  const entry = Object.entries(LEVEL_NAMES).find(([, label]) => label === name);
  return entry ? (Number(entry[0]) as DifficultyLevel) : 1;
}

/**
 * Rule-based AdaptiveEngine implementation. A future ML engine can implement
 * the same `AdaptiveEngine` interface without touching the UI or games.
 */
export const ruleBasedAdaptiveEngine: AdaptiveEngine = {
  calculatePerformance: calculateGamePerformance,
  calculateTrend,
  recommendDifficulty(category: GameCategory, currentDifficulty: DifficultyLevel, results: GameResult[]) {
    const forCategory = results.filter((r) => r.gameCategory === category);
    return calculateDifficultyRecommendation(currentDifficulty, forCategory);
  },
  updateFromResult(history: GameResult[], result: GameResult): GameResult[] {
    return [result, ...history].slice(0, ADAPTIVE_CONFIG.historyCap);
  },
};

export default ruleBasedAdaptiveEngine;

