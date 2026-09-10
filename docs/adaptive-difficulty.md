# Adaptive Difficulty (Phase 4B)

> **This is NOT a clinical assessment system.** It does not detect, diagnose,
> or predict any medical condition. "Declining" only means recent *game*
> performance decreased. It is a deterministic, local, rule-based game
> personalization system.

## 1. What the engine does

Reads the patient's previous `GameResult` records (already persisted by the
application data boundary) and recommends a difficulty **for the next game
session** of a given category. Nothing changes mid-game.

```
GameResult history → PatientDataContext → RuleBasedAdaptiveEngine
                                          → DifficultyRecommendation
                                          → next session's game config
```

## 2. Why rule-based logic

- Deterministic and fully testable — same input always yields same output.
- Explainable: every recommendation carries a plain reason string.
- Safe by construction: bounded 1–4, requires consistency, never reacts to one
  result. A future ML engine can implement the same `AdaptiveEngine` interface
  (`src/services/adaptive/types.ts`) without touching UI or games.

## 3. Inputs

Only fields already stored on `GameResult`: `accuracy`, `mistakes`,
`roundsCompleted`, `completionStatus`, `difficultyLevel`, `gameCategory`,
timestamps. Response time is **read but deliberately excluded** (see §9).

## 4. Performance score (0–100, pure function)

```
mistakesPerRound = mistakes / max(1, roundsCompleted)
performanceScore = round( 0.60 × accuracy
                        + 0.25 × max(0, 100 − 50 × mistakesPerRound)
                        + 0.15 × (completed ? 100 : 40) )
```

Accuracy dominates (60%), mistakes moderate (25%), completion minor (15%).

## 5. Thresholds (`src/services/adaptive/adaptiveConfig.ts`)

| Parameter | Value | Meaning |
|---|---|---|
| `strongAccuracy` | ≥ 90 | strong session accuracy gate |
| `strongMistakesPerRound` | ≤ 1 | strong session mistake gate |
| `weakAccuracy` | < 65 | weak session gate |
| `weakMistakesPerRound` | ≥ 2 | weak session gate |
| `strong/weakSessionsRequired` | 2 | consecutive sessions to act |
| `minCompletedSessions` | 2 | below → `insufficient_data` |
| `recentAbandonedForDecrease` | 2 | recent unfinished sessions → ease off |
| `trendDeltaPoints` | 10 | recent-vs-previous accuracy gap |
| `historyCap` | 50 | retained by `updateFromResult` |

## 6. Consistency rules

- Strong ×2 consecutive (newest first) → `increase`.
- Weak ×2 consecutive → `decrease` (never below 1).
- Mixed/1-off results → `maintain`. A single lucky or bad session never moves
  the difficulty.
- Bounds clamped: never below Easy (1), never above Advanced (4).
- At the floor/ceiling the action becomes `maintain` with an explanatory reason.

## 7. Difficulty levels

`1 = Easy`, `2 = Medium`, `3 = Hard`, `4 = Advanced`. New patients always start
at **1** (insufficient history → maintain).

## 8. Game-specific parameters (`src/services/games/gameConfig.ts`)

| Game | Easy | Medium | Hard | Advanced |
|---|---|---|---|---|
| Memory Match | 3 objects, 4.2 s view | 4 objects, 3.4 s | 5 objects, 2.8 s, 4 rounds | 6 objects, 2.4 s |
| Focus Finder | 6 objects, low similarity | 9, medium | 12, high similarity | 15, high |
| Routine | 2 routine + 2 recognition rounds, 3 options | 2 + 3 | 3 + 3, 4 options | 3 + 4 |

Easy (level 1) exactly matches the validated Phase 4A experience. The
recommended level is selected from `MEMORY_LEVELS / ATTENTION_LEVELS /
ROUTINE_LEVELS` and passed into the game module via the `GameModuleProps`
`difficulty` prop — so higher levels genuinely change object counts, viewing
time, distractor similarity, and round counts (covered by tests).

## 9. Trend logic

`calculateTrend()` splits completed sessions into recent vs previous halves:

- recentAvg − previousAvg ≥ +10 → `improving`
- ≤ −10 → `declining` (game performance only)
- otherwise → `stable`; fewer than 4 completed sessions → `insufficient_data`

## 10. Confidence interpretation

Confidence (0–1) reflects **evidence quality only**: it grows with the number
of consistent completed sessions (0.4 base + 0.1/session, capped 0.9; reduced
for mixed evidence; 0.25 with no data). It is NOT medically meaningful.

## 11. Limitations

- Rule-based heuristics, not a validated psychometric instrument.
- Single-device demo persistence; no cross-patient baselining yet.
- Response time intentionally unused; can be added as a *supporting* signal
  later without changing the interface.
- Per-category recommendations use each game's own history only.

## 12. Future ML interface

Implement `AdaptiveEngine` (`calculatePerformance`, `calculateTrend`,
`recommendDifficulty`, `updateFromResult`) and register the implementation
where `ruleBasedAdaptiveEngine` is consumed (`GameRunner`). No UI, game, or
persistence changes required. Any ML must remain local-first and must never be
presented as diagnosis.
