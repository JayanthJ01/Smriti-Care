import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Home, RotateCcw, Sparkles, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePatientData } from '../../contexts/PatientDataContext';
import { buildGameResult, createGameSession, formatGameDuration } from '../../services/games/gameService';
import { gameConfigFor } from '../../services/games/gameConfig';
import { gameRegistry, type GameId } from '../../services/games/gameRegistry';
import { ruleBasedAdaptiveEngine } from '../../services/adaptive/adaptiveEngine';
import { LEVEL_NAMES } from '../../services/adaptive/adaptiveConfig';
import type { DifficultyLevel } from '../../services/adaptive/types';
import type { GameResult, GameRoundResult, GameSession } from '../../types';
import Button from '../ui/Button';
import { cx } from '../../utils/helpers';

type Phase = 'instruction' | 'playing' | 'result' | 'exit-confirm';

/** Difficulty level → localized label key. */
const LEVEL_KEY: Record<DifficultyLevel, string> = {
  1: 'game.difficultyEasy',
  2: 'game.difficultyMedium',
  3: 'game.difficultyHard',
  4: 'game.difficultyAdvanced',
};

/** Difficulty of the newest recorded session for this category (default Easy). */
function currentLevelFor(category: string, results: GameResult[]): DifficultyLevel {
  const newest = results
    .filter((r) => r.gameCategory === category)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0];
  return newest ? ruleBasedAdaptiveEngineRecommendFromName(newest.difficultyLevel) : 1;
}

function ruleBasedAdaptiveEngineRecommendFromName(name: string): DifficultyLevel {
  const idx = (Object.values(LEVEL_NAMES) as string[]).indexOf(name);
  return (idx === -1 ? 0 : idx + 1) as DifficultyLevel;
}

/**
 * GameRunner — shared lifecycle: start session → instruction → rounds →
 * result → save through the application data boundary → return home.
 * Phase 4B: the adaptive engine recommends the difficulty BEFORE each
 * session starts; the level is then FIXED for the whole session.
 * Individual games own their gameplay inside `def.Component`.
 */
export default function GameRunner({ gameId, onExit }: { gameId: GameId; onExit: () => void }) {
  const def = gameRegistry[gameId];
  const { t } = useLanguage();
  const { patient, saveGameResult, gameResults } = usePatientData();
  const [phase, setPhase] = useState<Phase>('instruction');
  const [session, setSession] = useState<GameSession | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [level, setLevel] = useState<DifficultyLevel>(1);
  const roundsRef = useRef<GameRoundResult[]>([]);

  // Lock background scroll only while the full-screen game panel is open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const start = () => {
    roundsRef.current = [];
    setResult(null);
    // Ask the adaptive engine for the NEXT session's difficulty (never mid-game).
    const rec = ruleBasedAdaptiveEngine.recommendDifficulty(
      def.category,
      currentLevelFor(def.category, gameResults),
      gameResults,
    );
    setLevel(rec.recommendedDifficulty);
    const { totalRounds } = gameConfigFor(gameId, rec.recommendedDifficulty);
    setSession(
      createGameSession(
        def.gameId,
        def.category,
        patient.id,
        LEVEL_NAMES[rec.recommendedDifficulty],
        totalRounds,
      ),
    );
    setPhase('playing');
  };

  const handleRound = (r: GameRoundResult) => {
    roundsRef.current = [...roundsRef.current, r];
  };

  const handleComplete = (metadata?: Record<string, string | number | boolean | null>) => {
    if (!session) return;
    const res = buildGameResult(session, roundsRef.current, { gameId: def.gameId, ...metadata }, 'completed');
    saveGameResult(res);
    setResult(res);
    setPhase('result');
  };

  const requestExit = () => {
    if (phase === 'playing') {
      setPhase('exit-confirm');
    } else {
      onExit();
    }
  };

  const confirmExit = () => {
    // Record abandonment only when at least one round was meaningfully played.
    if (session && roundsRef.current.length > 0) {
      const res = buildGameResult(session, roundsRef.current, { gameId: def.gameId, abandonedAtRound: roundsRef.current.length }, 'abandoned');
      saveGameResult(res);
    }
    onExit();
  };

  const handleRoundRef = useRef(handleRound);
  handleRoundRef.current = handleRound;
  const handleCompleteRef = useRef(handleComplete);
  handleCompleteRef.current = handleComplete;

  const Game = def.Component;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-b from-cream-50 via-cream-100 to-mint-50"
      role="dialog"
      aria-modal="true"
      aria-label={t(def.titleKey)}
    >
      <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-4 py-4 sm:px-6">
        {/* Header */}
        <header className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-white/70 bg-white text-[28px] shadow-card" aria-hidden>
              {def.emoji}
            </span>
            <div className="min-w-0">
              <h2 className="truncate font-display text-[24px] font-semibold leading-tight text-pine-950 sm:text-[28px]">
                {t(def.titleKey)}
              </h2>
              <span className={cx('inline-flex items-center rounded-full px-3 py-0.5 text-[12px] font-extrabold uppercase tracking-[0.12em] text-white', def.chipClass)}>
                {t(LEVEL_KEY[level])}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={requestExit}
            aria-label={t('game.exit')}
            className="grid h-14 w-14 shrink-0 place-items-center rounded-full border-[1.5px] border-line bg-white text-pine-900 shadow-card transition hover:border-pine-700/40"
          >
            <X size={24} aria-hidden />
          </button>
        </header>

        {/* Body */}
        <div className="mt-4 flex flex-1 flex-col justify-center">
          {phase === 'instruction' && (
            <InstructionPanel def={def} level={level} onStart={start} onExit={onExit} />
          )}

          {phase === 'playing' && session && (
            <Game
              key={session.sessionId}
              difficulty={level}
              onRound={(r) => handleRoundRef.current(r)}
              onComplete={(m) => handleCompleteRef.current(m)}
            />
          )}

          {phase === 'result' && result && <ResultPanel result={result} onPlayAgain={start} onHome={onExit} />}

          {phase === 'exit-confirm' && <ExitConfirm onStay={() => setPhase('playing')} onLeave={confirmExit} />}
        </div>
      </div>
    </motion.div>
  );
}

function InstructionPanel({
  def,
  level,
  onStart,
  onExit,
}: {
  def: (typeof gameRegistry)[GameId];
  level: DifficultyLevel;
  onStart: () => void;
  onExit: () => void;
}) {
  const { t } = useLanguage();
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center rounded-3xl border-[1.5px] border-line bg-white p-6 text-center shadow-soft sm:p-8">
      <p className="text-[56px] leading-none" aria-hidden>
        {def.emoji}
      </p>
      <p className="smriti-eyebrow mt-3 border-line bg-cream-50 text-pine-800">{t('game.howTo')}</p>
      <p className="mt-2 text-[19px] font-bold leading-snug text-ink-700 sm:text-[21px]">{t(def.howToKey)}</p>
      <p className="mt-1 text-[16px] font-bold text-ink-500">
        {gameConfigFor(def.id, level).totalRounds} {t('game.rounds')} • {t(LEVEL_KEY[level])}
      </p>
      <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-lav-50 px-3 py-1 text-[14px] font-extrabold text-lav-700">
        <Sparkles size={15} aria-hidden /> {t('game.personalized')}
      </p>
      <Button size="lg" onClick={onStart} className="mt-5 w-full">
        {t('patient.start')} →
      </Button>
      <button
        type="button"
        onClick={onExit}
        className="mt-3 min-h-[3rem] px-4 text-[16px] font-extrabold text-ink-500 underline decoration-2 underline-offset-4 hover:text-pine-900"
      >
        {t('game.backHome')}
      </button>
    </div>
  );
}

function ResultPanel({
  result,
  onPlayAgain,
  onHome,
}: {
  result: GameResult;
  onPlayAgain: () => void;
  onHome: () => void;
}) {
  const { t } = useLanguage();
  const rows = [
    { label: t('game.score'), value: String(result.score) },
    { label: t('game.accuracy'), value: `${result.accuracy}%` },
    { label: t('game.time'), value: formatGameDuration(result.duration) },
    { label: t('game.difficulty'), value: result.difficultyLevel },
  ];
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center rounded-3xl border-[1.5px] border-pine-700/25 bg-white p-6 text-center shadow-soft sm:p-8">
      <motion.span
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 16 }}
        className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-b from-mint-50 to-mint-100 text-[40px] shadow-card"
        aria-hidden
      >
        🌟
      </motion.span>
      <h3 className="mt-3 font-display text-[32px] font-semibold leading-tight text-pine-950 sm:text-[36px]">
        {t('game.greatWork')}
      </h3>
      <p className="mt-1 text-[16px] font-bold text-ink-500">{t('game.resultSub')}</p>
      <dl className="mt-5 grid w-full grid-cols-2 gap-3">
        {rows.map((row) => (
          <div key={row.label} className="rounded-2xl border-[1.5px] border-line bg-cream-50 px-4 py-3">
            <dt className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-ink-500">{row.label}</dt>
            <dd className="mt-0.5 font-display text-[26px] font-semibold text-pine-950">{row.value}</dd>
          </div>
        ))}
      </dl>
      <Button size="lg" onClick={onPlayAgain} className="mt-5 w-full">
        <RotateCcw size={20} aria-hidden /> {t('game.playAgain')}
      </Button>
      <Button variant="ghost" size="lg" onClick={onHome} className="mt-3 w-full">
        <Home size={20} aria-hidden /> {t('game.backHome')}
      </Button>
    </div>
  );
}

function ExitConfirm({ onStay, onLeave }: { onStay: () => void; onLeave: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center rounded-3xl border-[1.5px] border-line bg-white p-6 text-center shadow-soft">
      <p className="text-[44px] leading-none" aria-hidden>
        🌿
      </p>
      <h3 className="mt-2 font-display text-[26px] font-semibold text-pine-950">{t('game.exitConfirm')}</h3>
      <div className="mt-5 grid w-full grid-cols-2 gap-3">
        <Button variant="ghost" size="lg" onClick={onStay}>
          {t('game.exitNo')}
        </Button>
        <Button variant="coral" size="lg" onClick={onLeave}>
          {t('game.exitYes')}
        </Button>
      </div>
    </div>
  );
}

