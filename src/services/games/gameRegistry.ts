import type { ComponentType } from 'react';
import type { GameCategory } from '../../types';
import type { GameModuleProps } from '../../components/games/GameModuleProps';
import MemoryMatch from '../../components/games/MemoryMatch';
import FocusFinder from '../../components/games/FocusFinder';
import RoutineRecognition from '../../components/games/RoutineRecognition';
import { ATTENTION_DIFFICULTY, MEMORY_DIFFICULTY, ROUTINE_DIFFICULTY } from './gameConfig';

export type GameId = 'memory' | 'attention' | 'routine';

export interface GameDefinition {
  id: GameId;
  gameId: string;
  category: GameCategory;
  titleKey: string;
  descriptionKey: string;
  howToKey: string;
  emoji: string;
  headerClass: string;
  chipClass: string;
  totalRounds: number;
  difficultyLevel: string;
  Component: ComponentType<GameModuleProps>;
}

/**
 * Game registry — metadata only. No game-specific gameplay logic lives
 * here; each game owns its own mechanics in its component.
 */
export const gameRegistry: Record<GameId, GameDefinition> = {
  memory: {
    id: 'memory',
    gameId: 'memory-match',
    category: 'memory',
    titleKey: 'game.memoryName',
    descriptionKey: 'cognitive.memoryDesc',
    howToKey: 'game.memoryHow',
    emoji: '🌸',
    headerClass: 'from-mint-100 to-white',
    chipClass: 'bg-pine-800',
    totalRounds: MEMORY_DIFFICULTY.rounds,
    difficultyLevel: MEMORY_DIFFICULTY.difficultyLevel,
    Component: MemoryMatch,
  },
  attention: {
    id: 'attention',
    gameId: 'focus-finder',
    category: 'attention',
    titleKey: 'game.attentionName',
    descriptionKey: 'cognitive.attentionDesc',
    howToKey: 'game.attentionHow',
    emoji: '🔍',
    headerClass: 'from-sky-100 to-white',
    chipClass: 'bg-sky-700',
    totalRounds: ATTENTION_DIFFICULTY.rounds,
    difficultyLevel: ATTENTION_DIFFICULTY.difficultyLevel,
    Component: FocusFinder,
  },
  routine: {
    id: 'routine',
    gameId: 'routine-recognition',
    category: 'routine-recognition',
    titleKey: 'game.routineName',
    descriptionKey: 'cognitive.routineDesc',
    howToKey: 'game.routineHow',
    emoji: '🔵',
    headerClass: 'from-lav-100 to-white',
    chipClass: 'bg-lav-600',
    totalRounds: ROUTINE_DIFFICULTY.routineRounds + ROUTINE_DIFFICULTY.recognitionRounds,
    difficultyLevel: ROUTINE_DIFFICULTY.difficultyLevel,
    Component: RoutineRecognition,
  },
};
