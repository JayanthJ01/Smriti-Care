import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { GameModuleProps } from './GameModuleProps';
import { MEMORY_LEVELS } from '../../services/games/gameConfig';
import { useLanguage } from '../../contexts/LanguageContext';
import { cx } from '../../utils/helpers';

interface Item {
  id: string;
  emoji: string;
  nameKey: string;
}

/** Familiar, Assam/NER-friendly objects (tea, mango, boat, bamboo basket…). */
const POOL: Item[] = [
  { id: 'teaCup', emoji: '☕', nameKey: 'obj.teaCup' },
  { id: 'mango', emoji: '🥭', nameKey: 'obj.mango' },
  { id: 'umbrella', emoji: '☂️', nameKey: 'obj.umbrella' },
  { id: 'basket', emoji: '🧺', nameKey: 'obj.basket' },
  { id: 'boat', emoji: '🛶', nameKey: 'obj.boat' },
  { id: 'rice', emoji: '🍚', nameKey: 'obj.ricePlate' },
];

type Phase = 'view' | 'find' | 'solved';

function shuffle<T>(list: T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * GAME 1 — Memory Match
 * Look at N familiar objects (N grows with difficulty), then find the one
 * asked for. `difficulty` (1–4) is fixed for the whole session.
 */
export default function MemoryMatch({ difficulty, onRound, onComplete }: GameModuleProps) {
  const { t } = useLanguage();
  const cfg = MEMORY_LEVELS[difficulty];
  const [round, setRound] = useState(1);
  const [items, setItems] = useState<Item[]>([]);
  const [target, setTarget] = useState<Item | null>(null);
  const [phase, setPhase] = useState<Phase>('view');
  const [wrongId, setWrongId] = useState<string | null>(null);
  const mistakesRef = useRef(0);
  const startRef = useRef(0);
  const timers = useRef<number[]>([]);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  useEffect(() => {
    const picked = shuffle(POOL).slice(0, cfg.itemCount);
    setItems(picked);
    setTarget(picked[Math.floor(Math.random() * picked.length)]);
    setPhase('view');
    setWrongId(null);
    mistakesRef.current = 0;
    startRef.current = Date.now();
    const timer = window.setTimeout(() => setPhase('find'), cfg.viewTimeMs);
    timers.current = [timer];
    return () => {
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const resolveRound = () => {
    setPhase('solved');
    const responseTimeMs = Date.now() - startRef.current;
    const mistakes = mistakesRef.current;
    later(() => {
      onRound({ round, correct: true, responseTimeMs, mistakes });
      if (round >= cfg.rounds) {
        onComplete({ section: 'memory', rounds: cfg.rounds, mistakesTotal: mistakes });
      } else {
        setRound((r) => r + 1);
      }
    }, 1400);
  };

  const tap = (item: Item) => {
    if (phase !== 'find') return;
    if (item.id === target?.id) {
      resolveRound();
    } else {
      mistakesRef.current += 1;
      setWrongId(item.id);
      later(() => setWrongId(null), 700);
    }
  };

  const roundLabel = t('game.roundOf').replace('{n}', String(round)).replace('{total}', String(cfg.rounds));

  return (
    <div className="w-full">
      <div className="flex flex-col items-center text-center">
        <span className="inline-flex items-center rounded-full bg-pine-800 px-4 py-1 text-[14px] font-extrabold text-white">
          {roundLabel}
        </span>
        <p className="mt-3 min-h-[2.5rem] text-[22px] font-bold text-ink-700 sm:text-[24px]" aria-live="polite">
          {phase === 'view' && t('game.lookCarefully')}
          {phase === 'find' && t('game.findThe').replace('{item}', target ? t(target.nameKey) : '')}
          {phase === 'solved' && t('game.correct')}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 sm:gap-4">
        {items.map((item) => {
          const revealed = phase === 'view' || (phase === 'solved' && item.id === target?.id);
          const isWrong = wrongId === item.id;
          return (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => tap(item)}
              disabled={phase !== 'find'}
              whileTap={phase === 'find' ? { scale: 0.96 } : undefined}
              animate={isWrong ? { x: [0, -7, 7, -4, 0] } : { x: 0 }}
              transition={{ duration: 0.35 }}
              aria-label={revealed ? t(item.nameKey) : undefined}
              className={cx(
                'grid min-h-[132px] place-items-center rounded-2xl border-[1.5px] p-3 transition sm:min-h-[150px]',
                'bg-white shadow-card',
                revealed
                  ? 'border-pine-700/40 bg-gradient-to-b from-white to-mint-50'
                  : 'border-line hover:border-pine-700/40',
                phase === 'solved' && item.id === target?.id && 'ring-4 ring-pine-700/30',
                isWrong && 'ring-4 ring-coral-500/40',
              )}
            >
              {revealed ? (
                <span className="flex flex-col items-center">
                  <span className="text-[52px] leading-none sm:text-[62px]" aria-hidden>
                    {item.emoji}
                  </span>
                  <span className="mt-2 text-[15px] font-extrabold text-ink-600">{t(item.nameKey)}</span>
                </span>
              ) : (
                <span className="text-[44px] leading-none text-pine-800/60" aria-hidden>
                  ❓
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
