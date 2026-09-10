import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { GameModuleProps } from './GameModuleProps';
import { ATTENTION_LEVELS } from '../../services/games/gameConfig';
import { useLanguage } from '../../contexts/LanguageContext';
import { cx } from '../../utils/helpers';

interface Target {
  emoji: string;
  nameKey: string;
}

const TARGETS: Target[] = [
  { emoji: '🌺', nameKey: 'obj.redFlower' },
  { emoji: '🦋', nameKey: 'obj.butterfly' },
  { emoji: '🐟', nameKey: 'obj.fish' },
];

/** Distractor pools by similarity — 'high' uses visually similar flowers. */
const EASY_DISTRACTORS = ['🌻', '🌿', '🍃', '⭐', '🌼', '🪷', '☀️', '🦜', '🌳', '🍉'];
const SIMILAR_DISTRACTORS = ['🌸', '🌷', '🏵️', '🌺', '💐', '🌼', '🪷', '🌻', '🥀', '🍁'];

function distractorsFor(similarity: 'low' | 'medium' | 'high', count: number): string[] {
  const pool =
    similarity === 'low' ? EASY_DISTRACTORS : similarity === 'medium' ? [...EASY_DISTRACTORS, ...SIMILAR_DISTRACTORS] : SIMILAR_DISTRACTORS;
  const picked: string[] = [];
  while (picked.length < count) {
    picked.push(pool[picked.length % pool.length]);
  }
  return shuffle(picked).slice(0, count);
}

interface Card {
  key: string;
  emoji: string;
  isTarget: boolean;
}

function shuffle<T>(list: T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildBoard(objectCount: number, similarity: 'low' | 'medium' | 'high', target: Target): Card[] {
  const distractors = distractorsFor(similarity, objectCount - 1);
  const cards: Card[] = [
    { key: `${target.emoji}-t`, emoji: target.emoji, isTarget: true },
    ...distractors.map((d, i) => ({ key: `${d}-${i}`, emoji: d, isTarget: false })),
  ];
  return shuffle(cards);
}

/**
 * GAME 2 — Focus Finder
 * A calm "find the object" round. No countdown timer; response time is
 * measured silently for analytics only. `difficulty` (1–4) changes the
 * object count + distractor similarity; it is fixed for the whole session.
 */
export default function FocusFinder({ difficulty, onRound, onComplete }: GameModuleProps) {
  const { t } = useLanguage();
  const cfg = ATTENTION_LEVELS[difficulty];
  const [round, setRound] = useState(1);
  const [target, setTarget] = useState<Target>(TARGETS[0]);
  const [cards, setCards] = useState<Card[]>([]);
  const [solved, setSolved] = useState(false);
  const [wrongKey, setWrongKey] = useState<string | null>(null);
  const mistakesRef = useRef(0);
  const startRef = useRef(0);

  useEffect(() => {
    const nextTarget = TARGETS[(round - 1) % TARGETS.length];
    setTarget(nextTarget);
    setCards(buildBoard(cfg.objectCount, cfg.similarity, nextTarget));
    setSolved(false);
    setWrongKey(null);
    mistakesRef.current = 0;
    startRef.current = Date.now();
  }, [round, cfg.objectCount]);

  const tap = (card: Card) => {
    if (solved) return;
    if (card.isTarget) {
      setSolved(true);
      const responseTimeMs = Date.now() - startRef.current;
      const mistakes = mistakesRef.current;
      window.setTimeout(() => {
        onRound({ round, correct: true, responseTimeMs, mistakes });
        if (round >= cfg.rounds) {
          onComplete({ section: 'attention', rounds: cfg.rounds, mistakesTotal: mistakes });
        } else {
          setRound((r) => r + 1);
        }
      }, 1300);
    } else {
      mistakesRef.current += 1;
      setWrongKey(card.key);
      window.setTimeout(() => setWrongKey(null), 700);
    }
  };

  const roundLabel = t('game.roundOf').replace('{n}', String(round)).replace('{total}', String(cfg.rounds));

  return (
    <div className="w-full">
      <div className="flex flex-col items-center text-center">
        <span className="inline-flex items-center rounded-full bg-sky-700 px-4 py-1 text-[14px] font-extrabold text-white">
          {roundLabel}
        </span>
        <p className="mt-3 min-h-[2.5rem] text-[22px] font-bold text-ink-700 sm:text-[24px]" aria-live="polite">
          {solved
            ? t('game.correct')
            : t('game.findThe').replace('{item}', `${t(target.nameKey)} ${target.emoji}`)}
        </p>
      </div>

      <div
        className={cx(
          'mt-5 grid gap-3 sm:gap-4',
          cfg.objectCount <= 6 ? 'grid-cols-3' : 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-5',
        )}
      >
        {cards.map((card) => {
          const isWrong = wrongKey === card.key;
          return (
            <motion.button
              key={card.key}
              type="button"
              onClick={() => tap(card)}
              disabled={solved}
              whileTap={solved ? undefined : { scale: 0.96 }}
              animate={isWrong ? { x: [0, -7, 7, -4, 0] } : { x: 0 }}
              transition={{ duration: 0.35 }}
              className={cx(
                'grid min-h-[96px] place-items-center rounded-2xl border-[1.5px] bg-white p-3 shadow-card transition sm:min-h-[112px]',
                'border-line hover:border-sky-600/50',
                solved && card.isTarget && 'border-pine-700/40 bg-gradient-to-b from-white to-mint-50 ring-4 ring-pine-700/30',
                isWrong && 'ring-4 ring-coral-500/40',
              )}
              aria-hidden={card.isTarget && solved ? undefined : true}
            >
              <span className={cx('leading-none', cfg.objectCount <= 9 ? 'text-[46px] sm:text-[54px]' : 'text-[38px] sm:text-[44px]')} aria-hidden>
                {card.emoji}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
