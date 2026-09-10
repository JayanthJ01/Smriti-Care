import type { GameCategory } from '../../types';

/**
 * Phase 4A difficulty — everything stays at EASY (level 1).
 * Difficulty is kept as explicit configuration so Phase 4B can add an
 * adaptive engine later without touching rendering/gameplay logic.
 */

export interface MemoryDifficultyConfig {
  difficultyLevel: string;
  itemCount: number;
  /** How long the objects stay visible before hiding (ms). */
  viewTimeMs: number;
  rounds: number;
}

export interface AttentionDifficultyConfig {
  difficultyLevel: string;
  objectCount: number;
  similarity: 'low' | 'medium' | 'high';
  /** 0 = no response window (calm, untimed for the patient). */
  responseWindowMs: number;
  rounds: number;
}

export interface RoutineDifficultyConfig {
  difficultyLevel: string;
  routineRounds: number;
  recognitionRounds: number;
  optionsCount: number;
}

export type MemoryGameCategory = GameCategory;

/*
 * Phase 4B — difficulty 1–4 (Easy → Advanced).
 * The adaptive engine (services/adaptive) recommends a LEVEL; the game module
 * receives it and renders from these tables. Easy (= level 1) matches the
 * validated Phase 4A behaviour exactly.
 */
import type { DifficultyLevel } from '../adaptive/types';

export const MEMORY_LEVELS: Record<DifficultyLevel, MemoryDifficultyConfig> = {
  1: { difficultyLevel: 'Easy', itemCount: 3, viewTimeMs: 4200, rounds: 3 },
  2: { difficultyLevel: 'Medium', itemCount: 4, viewTimeMs: 3400, rounds: 3 },
  3: { difficultyLevel: 'Hard', itemCount: 5, viewTimeMs: 2800, rounds: 4 },
  4: { difficultyLevel: 'Advanced', itemCount: 6, viewTimeMs: 2400, rounds: 4 },
};

export const ATTENTION_LEVELS: Record<DifficultyLevel, AttentionDifficultyConfig> = {
  1: { difficultyLevel: 'Easy', objectCount: 6, similarity: 'low', responseWindowMs: 0, rounds: 3 },
  2: { difficultyLevel: 'Medium', objectCount: 9, similarity: 'medium', responseWindowMs: 0, rounds: 3 },
  3: { difficultyLevel: 'Hard', objectCount: 12, similarity: 'high', responseWindowMs: 0, rounds: 4 },
  4: { difficultyLevel: 'Advanced', objectCount: 15, similarity: 'high', responseWindowMs: 0, rounds: 4 },
};

export const ROUTINE_LEVELS: Record<DifficultyLevel, RoutineDifficultyConfig> = {
  1: { difficultyLevel: 'Easy', routineRounds: 2, recognitionRounds: 2, optionsCount: 3 },
  2: { difficultyLevel: 'Medium', routineRounds: 2, recognitionRounds: 3, optionsCount: 3 },
  3: { difficultyLevel: 'Hard', routineRounds: 3, recognitionRounds: 3, optionsCount: 4 },
  4: { difficultyLevel: 'Advanced', routineRounds: 3, recognitionRounds: 4, optionsCount: 4 },
};

/** Legacy aliases — level 1 keeps the validated Phase 4A experience. */
export const MEMORY_DIFFICULTY = MEMORY_LEVELS[1];
export const ATTENTION_DIFFICULTY = ATTENTION_LEVELS[1];
export const ROUTINE_DIFFICULTY = ROUTINE_LEVELS[1];

/** Total rounds a game will have at a given level (used by GameRunner). */
export function gameConfigFor(gameId: string, level: DifficultyLevel): { totalRounds: number } {
  switch (gameId) {
    case 'attention':
      return { totalRounds: ATTENTION_LEVELS[level].rounds };
    case 'routine-recognition':
      return {
        totalRounds: ROUTINE_LEVELS[level].routineRounds + ROUTINE_LEVELS[level].recognitionRounds,
      };
    case 'memory':
    default:
      return { totalRounds: MEMORY_LEVELS[level].rounds };
  }
}

