import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { GameModuleProps } from './GameModuleProps';
import { ROUTINE_LEVELS } from '../../services/games/gameConfig';
import { useLanguage } from '../../contexts/LanguageContext';
import { cx } from '../../utils/helpers';

interface Piece {
  emoji: string;
  nameKey: string;
}

/** Familiar daily steps + Assam/NER-friendly objects for recognition. */
const PIECES: Record<string, Piece> = {
  wakeUp: { emoji: '🌅', nameKey: 'routine.wakeUp' },
  brushTeeth: { emoji: '🪥', nameKey: 'routine.brushTeeth' },
  drinkWater: { emoji: '💧', nameKey: 'routine.drinkWater' },
  eatBreakfast: { emoji: '🍚', nameKey: 'routine.eatBreakfast' },
  takeMedicine: { emoji: '💊', nameKey: 'routine.takeMedicine' },
  goForWalk: { emoji: '🚶', nameKey: 'routine.goForWalk' },
  sleep: { emoji: '🌙', nameKey: 'routine.sleep' },
  teaCup: { emoji: '☕', nameKey: 'obj.teaCup' },
  umbrella: { emoji: '☂️', nameKey: 'obj.umbrella' },
  boat: { emoji: '🛶', nameKey: 'obj.boat' },
  mango: { emoji: '🥭', nameKey: 'obj.mango' },
  basket: { emoji: '🧺', nameKey: 'obj.basket' },
  rice: { emoji: '🍲', nameKey: 'obj.ricePlate' },
  sun: { emoji: '☀️', nameKey: 'obj.sun' },
  fish: { emoji: '🐟', nameKey: 'obj.fish' },
};

const ROUTINE_ROUNDS = [
  { seq: ['wakeUp', 'brushTeeth'], answer: 'eatBreakfast', options: ['eatBreakfast', 'goForWalk', 'sleep'] },
  { seq: ['eatBreakfast', 'takeMedicine'], answer: 'goForWalk', options: ['goForWalk', 'wakeUp', 'brushTeeth'] },
];

const RECOGNITION_ROUNDS = [
  { answer: 'teaCup', options: ['teaCup', 'umbrella', 'boat', 'mango'] },
  { answer: 'basket', options: ['basket', 'rice', 'sun', 'fish'] },
];

type Phase = 'asking' | 'solved';

function shuffleOpts(list: string[]): string[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}


/**
 * GAME 3 — Routine + Recognition (Easy). ONE module, two related rounds:
 * Round A: daily routine ("What comes next?")
 * Round B: recognition ("Tap the …") with familiar Assam-inspired objects.
 */
export default function RoutineRecognition({ difficulty, onRound, onComplete }: GameModuleProps) {
  const { t } = useLanguage();
  const cfg = ROUTINE_LEVELS[difficulty];
  const totalRounds = cfg.routineRounds + cfg.recognitionRounds;
  const [roundNo, setRoundNo] = useState(1);
  const [options, setOptions] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>('asking');
  const [wrongKey, setWrongKey] = useState<string | null>(null);
  const mistakesRef = useRef(0);
  const firstTryRef = useRef(true);
  const startRef = useRef(0);
  const statsRef = useRef({ routineFirstTry: 0, recognitionFirstTry: 0 });

  const isRoutine = roundNo <= cfg.routineRounds;
  const routineRound = ROUTINE_ROUNDS[(roundNo - 1) % ROUTINE_ROUNDS.length];
  const recognitionRound = RECOGNITION_ROUNDS[(roundNo - cfg.routineRounds - 1) % RECOGNITION_ROUNDS.length];
  const answerKey = isRoutine ? routineRound.answer : recognitionRound.answer;

  useEffect(() => {
    const opts = isRoutine ? routineRound.options : recognitionRound.options;
    setOptions(shuffleOpts(opts));
    setPhase('asking');
    setWrongKey(null);
    mistakesRef.current = 0;
    firstTryRef.current = true;
    startRef.current = Date.now();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundNo]);

  const advance = () => {
    setPhase('solved');
    const responseTimeMs = Date.now() - startRef.current;
    const mistakes = mistakesRef.current;
    if (firstTryRef.current) {
      if (isRoutine) statsRef.current.routineFirstTry += 1;
      else statsRef.current.recognitionFirstTry += 1;
    }
    window.setTimeout(() => {
      onRound({ round: roundNo, correct: true, responseTimeMs, mistakes });
      if (roundNo >= totalRounds) {
        onComplete({
          routineRounds: cfg.routineRounds,
          recognitionRounds: cfg.recognitionRounds,
          routineFirstTry: statsRef.current.routineFirstTry,
          recognitionFirstTry: statsRef.current.recognitionFirstTry,
        });
      } else {
        setRoundNo((r) => r + 1);
      }
    }, 1400);
  };

  const tap = (key: string) => {
    if (phase !== 'asking') return;
    if (key === answerKey) {
      advance();
    } else {
      mistakesRef.current += 1;
      firstTryRef.current = false;
      setWrongKey(key);
      window.setTimeout(() => setWrongKey(null), 700);
    }
  };

  const roundLabel = t('game.roundOf').replace('{n}', String(roundNo)).replace('{total}', String(totalRounds));
  const sectionLabel = isRoutine ? t('game.routineSection') : t('game.recognitionSection');

  return (
    <div className="w-full">
      <div className="flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-lav-600 px-4 py-1 text-[14px] font-extrabold text-white">
          {roundLabel} • {sectionLabel}
        </span>
        <p className="mt-3 min-h-[2.5rem] text-[22px] font-bold text-ink-700 sm:text-[24px]" aria-live="polite">
          {phase === 'solved'
            ? t('game.correct')
            : isRoutine
              ? t('game.whatNext')
              : t('game.tapThe').replace('{item}', `${t(PIECES[answerKey].nameKey)} ${PIECES[answerKey].emoji}`)}
        </p>
      </div>

      {isRoutine && <RoutineSequence seq={routineRound.seq} solvedEmoji={phase === 'solved' ? PIECES[answerKey].emoji : null} />}

      <OptionGrid
        options={options}
        asking={phase === 'asking'}
        answerKey={answerKey}
        solved={phase === 'solved'}
        wrongKey={wrongKey}
        onPick={tap}
        cols={isRoutine ? 3 : 4}
      />
    </div>
  );

function RoutineSequence({ seq, solvedEmoji }: { seq: string[]; solvedEmoji: string | null }) {
  return (
    <div className="mt-5 flex items-center justify-center gap-2 sm:gap-3">
      {seq.map((key) => (
        <SequencePiece key={key} emoji={PIECES[key].emoji} label={PIECES[key].nameKey} />
      ))}
      <span
        className={cx(
          'grid h-[92px] w-[92px] place-items-center rounded-2xl border-[1.5px] border-dashed border-lav-600/50 bg-white/70 shadow-card sm:h-[104px] sm:w-[104px]',
          solvedEmoji && 'border-solid border-pine-700/40 ring-4 ring-pine-700/25',
        )}
      >
        <span className="text-[40px] leading-none text-lav-700 sm:text-[46px]" aria-hidden>
          {solvedEmoji ?? '❓'}
        </span>
      </span>
    </div>
  );
}

function SequencePiece({ emoji, label }: { emoji: string; label: string }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <span
        title={label}
        className="grid h-[92px] w-[92px] place-items-center rounded-2xl border-[1.5px] border-pine-700/25 bg-gradient-to-b from-white to-lav-50 shadow-card sm:h-[104px] sm:w-[104px]"
      >
        <span className="text-[40px] leading-none sm:text-[46px]" aria-hidden>
          {emoji}
        </span>
      </span>
      <span className="text-[26px] font-bold text-pine-900" aria-hidden>
        →
      </span>
    </div>
  );
}

interface OptionGridProps {
  options: string[];
  asking: boolean;
  answerKey: string;
  solved: boolean;
  wrongKey: string | null;
  onPick: (key: string) => void;
  cols: 3 | 4;
}

function OptionGrid({ options, asking, answerKey, solved, wrongKey, onPick, cols }: OptionGridProps) {
  const { t } = useLanguage();
  return (
    <div
      className={cx(
        'mt-6 grid gap-3 sm:gap-4',
        cols === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4',
      )}
    >
      {options.map((key) => {
        const isWrong = wrongKey === key;
        const isAnswer = solved && key === answerKey;
        return (
          <motion.button
            key={key}
            type="button"
            onClick={() => onPick(key)}
            disabled={!asking}
            whileTap={asking ? { scale: 0.96 } : undefined}
            animate={isWrong ? { x: [0, -7, 7, -4, 0] } : { x: 0 }}
            transition={{ duration: 0.35 }}
            className={cx(
              'flex flex-col items-center rounded-2xl border-[1.5px] bg-white p-3 shadow-card transition',
              'border-line hover:border-lav-600/50',
              isAnswer && 'border-pine-700/40 bg-gradient-to-b from-white to-mint-50 ring-4 ring-pine-700/30',
              isWrong && 'ring-4 ring-coral-500/40',
            )}
          >
            <span className="text-[42px] leading-none sm:text-[50px]" aria-hidden>
              {PIECES[key].emoji}
            </span>
            <span className="mt-2 text-[15px] font-extrabold text-ink-600">{t(PIECES[key].nameKey)}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

}
