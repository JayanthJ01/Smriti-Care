import type { GameRoundResult } from '../../types';
import type { DifficultyLevel } from '../../services/adaptive/types';

/**
 * Shared contract between GameRunner and every game module.
 * Games own their gameplay + per-round timing; the runner owns the
 * session lifecycle, result creation and persistence.
 * `difficulty` is FIXED for the whole session (Phase 4B — never mid-game).
 */
export interface GameModuleProps {
  /** 1–4, resolved by the adaptive engine before the session starts. */
  difficulty: DifficultyLevel;
  /** Report the outcome of one finished round (called once per round). */
  onRound: (round: GameRoundResult) => void;
  /** Call when all rounds are finished, with optional section metadata. */
  onComplete: (metadata?: Record<string, string | number | boolean | null>) => void;
}
