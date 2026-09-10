import { useLanguage } from '../../../contexts/LanguageContext';
import { usePatientData } from '../../../contexts/PatientDataContext';
import type { Patient } from '../../../types';
import type { DifficultyLevel } from '../../../services/adaptive/types';
import Card from '../../../components/ui/Card';
import {
  calculateGamePerformance,
  calculateAverageAccuracy,
  calculateTrend,
  groupPerformanceByCategory,
  ruleBasedAdaptiveEngine,
} from '../../../services/adaptive/adaptiveEngine';
import { LEVEL_NAMES } from '../../../services/adaptive/adaptiveConfig';
import { gameRegistry, type GameId } from '../../../services/games/gameRegistry';

const CATEGORIES: GameId[] = ['memory', 'attention', 'routine'];

function categoryLabel(t: (k: string) => string, gameId: GameId): string {
  const labels: Record<GameId, string> = {
    memory: 'caregiver.memory',
    attention: 'caregiver.attention',
    routine: 'caregiver.routineRecall',
  };
  return t(labels[gameId]);
}

function TrendBadge({ trend, t }: { trend: string; t: (k: string) => string }) {
  const map: Record<string, string> = {
    improving: 'bg-mint-100 text-pine-800',
    stable: 'bg-sky-100 text-sky-700',
    declining: 'bg-coral-50 text-coral-600',
    insufficient_data: 'bg-cream-100 text-ink-500',
  };
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-[13px] font-extrabold ${map[trend] ?? map.insufficient_data}`}>
      {t(`caregiver.trend.${trend}`)}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-cream-50 px-3 py-2">
      <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink-500">{label}</p>
      <p className="font-display text-[20px] font-semibold text-pine-950">{value}</p>
    </div>
  );
}

export default function CognitiveProgressSection({ patient }: { patient: Patient }) {
  const { t } = useLanguage();
  const { gameResults } = usePatientData();
  const grouped = groupPerformanceByCategory(gameResults);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-[22px] font-semibold text-pine-950">{t('caregiver.cognitiveTitle')}</h2>
        <p className="text-[14px] font-bold text-ink-500">{t('caregiver.cognitiveSub')}</p>
      </div>

      {gameResults.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-[16px] font-bold text-ink-500">{t('caregiver.empty.cognitive')}</p>
        </Card>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {CATEGORIES.map((gid) => {
              const def = gameRegistry[gid];
              const catResults = grouped[def.category] || [];
              if (catResults.length === 0) return null;
              const latest = catResults[0];
              const perf = calculateGamePerformance(latest);
              const avgAcc = calculateAverageAccuracy(catResults);
              const trend = calculateTrend(catResults);
              const currentLevel = (parseInt(latest.difficultyLevel, 10) as DifficultyLevel) || 1;
              const rec = ruleBasedAdaptiveEngine.recommendDifficulty(def.category, currentLevel, catResults);
              return (
                <Card key={gid} className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-cream-100 text-[20px]" aria-hidden>
                        {def.emoji}
                      </span>
                      <h3 className="font-display text-[17px] font-semibold text-pine-950">{categoryLabel(t, gid)}</h3>
                    </div>
                    <TrendBadge trend={trend} t={t} />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                    <Stat label={t('caregiver.latestScore')} value={String(perf.performanceScore)} />
                    <Stat label={t('caregiver.averageAccuracy')} value={`${avgAcc}%`} />
                    <Stat label={t('caregiver.gamesCompleted')} value={String(catResults.length)} />
                    <Stat label={t('caregiver.currentDifficulty')} value={LEVEL_NAMES[rec.recommendedDifficulty]} />
                  </div>
                  <p className="mt-2 text-[12px] font-bold text-ink-500">
                    {t('caregiver.lastPlayed')}: {new Date(latest.completedAt).toLocaleDateString()}
                  </p>
                </Card>
              );
            })}
          </div>

          <Card tone="cream" className="p-4">
            <h3 className="font-display text-[17px] font-semibold text-pine-950">{t('caregiver.recentActivity')}</h3>
            <div className="mt-2 space-y-2">
              {gameResults.slice(0, 5).map((r) => {
                const def = gameRegistry[r.gameId as GameId];
                return (
                  <div key={r.id} className="flex items-center justify-between gap-2 rounded-2xl border border-line bg-white px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[18px]" aria-hidden>
                        {def?.emoji ?? '🧩'}
                      </span>
                      <span className="truncate text-[14px] font-bold text-ink-700">
                        {t(def?.titleKey ?? `game.${r.gameId}`)}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 text-[13px] font-extrabold text-ink-600">
                      <span>{t('caregiver.score')}: {r.score}</span>
                      <span>{t('caregiver.accuracy')}: {r.accuracy}%</span>
                      <span className="rounded-full bg-cream-100 px-2 py-0.5">
                        {LEVEL_NAMES[(parseInt(r.difficultyLevel, 10) as DifficultyLevel) || 1]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

