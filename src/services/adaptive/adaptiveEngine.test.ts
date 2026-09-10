import { describe, expect, it } from 'vitest';
import {
  calculateAverageAccuracy,
  calculateGamePerformance,
  calculateRecentPerformance,
  completedOnly,
  ruleBasedAdaptiveEngine,
} from './adaptiveEngine';
import { ADAPTIVE_CONFIG } from './adaptiveConfig';
import {
  ATTENTION_LEVELS,
  MEMORY_LEVELS,
  ROUTINE_LEVELS,
  gameConfigFor,
} from '../games/gameConfig';
import type { GameCategory, GameResult } from '../../types';

/** Deterministic GameResult factory for the adaptive spec cases. */
function makeResult(overrides: Partial<GameResult> = {}): GameResult {
  return {
    id: 'r',
    gameId: 'memory',
    patientId: 'p1',
    sessionId: 's1',
    gameCategory: 'memory',
    score: 80,
    accuracy: 90,
    correctAnswers: 9,
    incorrectAnswers: 1,
    mistakes: 0,
    responseTimeAverage: 3200,
    duration: 90_000,
    difficultyLevel: 'Easy',
    roundsCompleted: 3,
    completionStatus: 'completed',
    startedAt: new Date(0).toISOString(),
    completedAt: new Date(60_000).toISOString(),
    metadata: {},
    ...overrides,
  };
}

/** Build an ordered history: newest session LAST in the array (like storage). */
function history(
  entries: Array<{ accuracy: number; mistakes?: number; status?: 'completed' | 'abandoned'; category?: GameCategory }>,
  category: GameCategory = 'memory',
): GameResult[] {
  return entries.map((e, i) =>
    makeResult({
      gameCategory: e.category ?? category,
      accuracy: e.accuracy,
      mistakes: e.mistakes ?? 0,
      completionStatus: e.status ?? 'completed',
      completedAt: new Date((i + 1) * 60_000).toISOString(),
    }),
  );
}

describe('calculateGamePerformance (pure)', () => {
  it('scores a strong completed session high', () => {
    const p = calculateGamePerformance(makeResult({ accuracy: 92, mistakes: 1, roundsCompleted: 3 }));
    expect(p.performanceScore).toBeGreaterThanOrEqual(85);
    expect(p.completed).toBe(true);
  });

  it('scores a weak, mistake-heavy session low', () => {
    const p = calculateGamePerformance(makeResult({ accuracy: 52, mistakes: 6, roundsCompleted: 3 }));
    expect(p.performanceScore).toBeLessThan(55);
  });

  it('excludes response time from the score (slower is never punished)', () => {
    const fast = calculateGamePerformance(makeResult({ responseTimeAverage: 1000 }));
    const slow = calculateGamePerformance(makeResult({ responseTimeAverage: 60_000 }));
    expect(fast.performanceScore).toBe(slow.performanceScore);
  });
});

describe('spec cases — recommendDifficulty', () => {
  const rec = (level: 1 | 2 | 3 | 4, results: GameResult[], category: GameCategory = 'memory') =>
    ruleBasedAdaptiveEngine.recommendDifficulty(category, level, results);

  it('CASE 1: no history → stay Easy, insufficient_data', () => {
    const r = rec(1, []);
    expect(r.recommendedDifficulty).toBe(1);
    expect(r.trend).toBe('insufficient_data');
    expect(r.nextAction).toBe('maintain');
    expect(r.confidence).toBeLessThanOrEqual(0.25);
  });

  it('CASE 2: Easy 93/95/91 → recommend Medium (increase)', () => {
    const r = rec(1, history([{ accuracy: 91 }, { accuracy: 95 }, { accuracy: 93 }]));
    expect(r.nextAction).toBe('increase');
    expect(r.recommendedDifficulty).toBe(2);
  });

  it('CASE 3: Medium 88/84/87 → maintain Medium', () => {
    const r = rec(2, history([{ accuracy: 87 }, { accuracy: 84 }, { accuracy: 88 }]));
    expect(r.nextAction).toBe('maintain');
    expect(r.recommendedDifficulty).toBe(2);
  });

  it('CASE 4: Medium 52/58 → recommend Easy (decrease)', () => {
    const r = rec(2, history([{ accuracy: 58, mistakes: 2 }, { accuracy: 52, mistakes: 2 }]));
    expect(r.nextAction).toBe('decrease');
    expect(r.recommendedDifficulty).toBe(1);
  });

  it('CASE 5: mixed 92/61/87 → maintain (inconsistent evidence)', () => {
    const r = rec(2, history([{ accuracy: 87 }, { accuracy: 61 }, { accuracy: 92 }]));
    expect(r.nextAction).toBe('maintain');
    expect(r.recommendedDifficulty).toBe(2);
  });

  it('CASE 6: already Easy + weak performance → remain Easy', () => {
    const r = rec(1, history([{ accuracy: 55, mistakes: 2 }, { accuracy: 60, mistakes: 2 }]));
    expect(r.recommendedDifficulty).toBe(1);
    expect(r.nextAction).toBe('maintain');
  });

  it('CASE 7: already Advanced + strong performance → remain Advanced', () => {
    const r = rec(4, history([{ accuracy: 94 }, { accuracy: 96 }]));
    expect(r.recommendedDifficulty).toBe(4);
    expect(r.nextAction).toBe('maintain');
  });

  it('CASE 8: repeated incomplete sessions ease off; incomplete never counts as strong/weak', () => {
    const abandoned = history([
      { accuracy: 40, status: 'abandoned' },
      { accuracy: 40, status: 'abandoned' },
    ]);
    expect(rec(2, abandoned).nextAction).toBe('decrease');
    const mixed = history([{ accuracy: 95 }, { accuracy: 95, status: 'abandoned' }]);
    expect(completedOnly(mixed)).toHaveLength(1);
    expect(rec(1, mixed).nextAction).toBe('maintain'); // only 1 completed → insufficient
  });

  it('only uses history of the requested category', () => {
    const results = [
      ...history([{ accuracy: 95 }, { accuracy: 95 }], 'attention'),
      ...history([{ accuracy: 55 }, { accuracy: 55 }], 'memory'),
    ];
    const attention = ruleBasedAdaptiveEngine.recommendDifficulty('attention', 1, results);
    const memory = ruleBasedAdaptiveEngine.recommendDifficulty('memory', 1, results);
    expect(attention.nextAction).toBe('increase');
    // Memory's weak history is ignored (different category), so it stays at Easy —
    // CASE 6: already at minimum difficulty, weak performance → remain Easy.
    expect(memory.recommendedDifficulty).toBe(1);
    expect(memory.nextAction).toBe('maintain');
  });
});

describe('trend + supporting pure functions', () => {
  it('improving: recent average well above previous', () => {
    const results = history([
      { accuracy: 60 }, { accuracy: 62 },
      { accuracy: 90 }, { accuracy: 92 },
    ]);
    expect(ruleBasedAdaptiveEngine.calculateTrend(results)).toBe('improving');
  });

  it('declining means only that game performance decreased', () => {
    const results = history([
      { accuracy: 92 }, { accuracy: 90 },
      { accuracy: 58 }, { accuracy: 55 },
    ]);
    expect(ruleBasedAdaptiveEngine.calculateTrend(results)).toBe('declining');
  });

  it('stable and insufficient_data', () => {
    const stable = history([{ accuracy: 80 }, { accuracy: 82 }, { accuracy: 81 }, { accuracy: 80 }]);
    expect(ruleBasedAdaptiveEngine.calculateTrend(stable)).toBe('stable');
    expect(ruleBasedAdaptiveEngine.calculateTrend([])).toBe('insufficient_data');
  });

  it('updateFromResult prepends and caps history', () => {
    let h: GameResult[] = history([{ accuracy: 90 }, { accuracy: 90 }]);
    for (let i = 0; i < ADAPTIVE_CONFIG.historyCap + 5; i += 1) {
      h = ruleBasedAdaptiveEngine.updateFromResult(h, makeResult({ sessionId: `s${i}` }));
    }
    expect(h).toHaveLength(ADAPTIVE_CONFIG.historyCap);
    expect(h[0].sessionId).toBe(`s${ADAPTIVE_CONFIG.historyCap + 4}`);
  });

  it('calculateAverageAccuracy / calculateRecentPerformance are pure helpers', () => {
    const results = history([{ accuracy: 90 }, { accuracy: 94 }]);
    expect(calculateAverageAccuracy(results)).toBe(92);
    expect(calculateRecentPerformance(results)).toBeGreaterThan(0);
    expect(calculateRecentPerformance([])).toBe(0);
  });
});

describe('spec cases 9–13 — difficulty changes actual gameplay parameters', () => {
  it('CASE 9+10: Memory level 2 uses more objects and shorter viewing than level 1', () => {
    expect(MEMORY_LEVELS[2].itemCount).toBeGreaterThan(MEMORY_LEVELS[1].itemCount);
    expect(MEMORY_LEVELS[2].viewTimeMs).toBeLessThan(MEMORY_LEVELS[1].viewTimeMs);
    expect(MEMORY_LEVELS[4].itemCount).toBeGreaterThan(MEMORY_LEVELS[2].itemCount);
    expect(gameConfigFor('memory', 3).totalRounds).toBe(MEMORY_LEVELS[3].rounds);
  });

  it('CASE 11: Attention level 2+ uses more objects and more similar distractors', () => {
    expect(ATTENTION_LEVELS[2].objectCount).toBeGreaterThan(ATTENTION_LEVELS[1].objectCount);
    expect(ATTENTION_LEVELS[1].similarity).toBe('low');
    expect(ATTENTION_LEVELS[3].similarity).toBe('high');
    expect(ATTENTION_LEVELS[4].objectCount).toBeGreaterThan(ATTENTION_LEVELS[2].objectCount);
    expect(gameConfigFor('attention', 2).totalRounds).toBe(ATTENTION_LEVELS[2].rounds);
  });

  it('CASE 12: Routine level 3 adds more activities and options', () => {
    expect(ROUTINE_LEVELS[3].routineRounds).toBeGreaterThan(ROUTINE_LEVELS[1].routineRounds);
    expect(ROUTINE_LEVELS[3].optionsCount).toBeGreaterThan(ROUTINE_LEVELS[1].optionsCount);
    expect(gameConfigFor('routine-recognition', 2).totalRounds).toBe(
      ROUTINE_LEVELS[2].routineRounds + ROUTINE_LEVELS[2].recognitionRounds,
    );
  });

  it('CASE 13: Recognition round count scales with level (combined module)', () => {
    expect(ROUTINE_LEVELS[2].recognitionRounds).toBeGreaterThan(ROUTINE_LEVELS[1].recognitionRounds);
    expect(ROUTINE_LEVELS[4].recognitionRounds).toBeGreaterThan(ROUTINE_LEVELS[2].recognitionRounds);
  });

  it('end-to-end: strong Easy history → Medium config selected for next session', () => {
    const results = history([{ accuracy: 93 }, { accuracy: 95 }, { accuracy: 91 }]);
    const r = ruleBasedAdaptiveEngine.recommendDifficulty('memory', 1, results);
    const next = MEMORY_LEVELS[r.recommendedDifficulty];
    expect(r.recommendedDifficulty).toBe(2);
    expect(next.itemCount).toBe(4);
    expect(next.difficultyLevel).toBe('Medium');
  });
});

