# Implementation Gaps — Found & Fixed

Audit performed 2026-05-03, after the initial scaffolding was complete.
All three critical bugs have been fixed in the same commit.

---

## Bug 1 — `StageDto.windowOpen/windowClosesAt` never populated

**File:** `apps/backend/src/stages/stages.service.ts`

**Problem:** `findAll()` and `findOne()` returned raw Prisma `Stage` objects. The `StageDto` contract requires `windowOpen: boolean` and `windowClosesAt: string | null`, but these fields were never computed. Every stage arrived at the frontend as `windowOpen = undefined`, which is falsy. The predictions page rendered all stages as permanently closed.

**Fix:** Both methods now compute window status inline. Matches are already fetched in `orderBy: { scheduledAt: 'asc' }` order, so `stage.matches[0]` is the first match. `windowOpen = now < firstMatch.scheduledAt`.

---

## Bug 2 — `PredictionSummaryDto` shape mismatch

**Files:** `apps/backend/src/predictions/predictions.service.ts`,
`apps/backend/src/users/users.service.ts`

**Problem:** Both `findForUser()` and `getParticipantDetail()` returned nested Prisma objects of the form `{ ..., match: { homeTeam, awayTeam, ... } }`. The `PredictionSummaryDto` contract (and what the frontend accessed) is a flat shape: `{ homeTeam, awayTeam, scheduledAt, score, points, ... }` at the top level. Accessing `p.homeTeam.name` crashed because `homeTeam` sat at `p.match.homeTeam`.

**Fix:** Both service methods now `.map()` the Prisma result to the flat `PredictionSummaryDto` shape before returning. The `score` object is also shaped to `ScoreDto` (including `lockedAt` as ISO string).

Additionally, `getParticipantDetail()` was missing the `rank` field required by `ParticipantDetailDto`. A `computeRank()` helper was added — it queries all confirmed participants, sorts by total points, and returns the tied-rank position for the requested user (O(N), fine at ≤200 participants).

---

## Bug 3 — Knockout scoring: non-tie prediction + penalty match

**File:** `apps/backend/src/scores/scores.service.ts`

**Problem:** `calcKnockoutPoints()` handled the case where the actual score is a non-zero result (e.g. 2–1) correctly, but when the actual score was a tie that went to penalties (e.g. 1–1 → Team A wins PKs), a non-tie prediction (e.g. 2–1 for Team A) earned 0 result points. The code had `pts += 0 // handled below` with no follow-through, because the method lacked the `homeTeamId` needed to map `penaltyWinnerId` to a home/away side.

**Fix:** `calculatePoints()` now passes `match.homeTeamId` to `calcKnockoutPoints()`. The result-check for non-tie predictions was rewritten:

```
actualWinnerIsHome =
  hadPenalties → penaltyWinnerId === homeTeamId
  else         → homeGoals > awayGoals
```

This correctly handles all cases: 90-min winner, ET winner, and penalty winner.

---

## Non-blocking gaps also addressed

| Item | Change |
|---|---|
| Production API URL hardcoded to `/api` | `apps/frontend/src/api/client.ts` now reads `VITE_API_URL` env var; falls back to `/api` for dev |
| No SPA routing for Vercel | `apps/frontend/vercel.json` added with catch-all rewrite to `index.html` |
| No frontend `.env.example` | `apps/frontend/.env.example` added |
