# CLAUDE.md

## Project

IH Quiniela WC 2026 — company-internal World Cup 2026 prediction pool. Participants pay an entry fee (Q200), submit match predictions before each stage locks, and earn points based on accuracy. Read [docs/adr/](./docs/adr/) for recorded architectural decisions.

## Monorepo

pnpm workspaces. Three packages:

- `apps/backend` — NestJS API (port 3000)
- `apps/frontend` — React + Vite SPA (port 5173)
- `packages/types` — shared TypeScript types; both apps import from `@quiniela/types`

Run everything: `pnpm dev` from the root.

## Domain model

### Key terms

- **User** — a system account. Holds one or more roles: `PARTICIPANT`, `ADMIN`, or both.
- **Participant** — a User whose Registration has been confirmed by an Admin. Only confirmed Participants earn Points. Never say "player" or "member".
- **Alias** — a Participant's public display name (unique, spaces and special characters allowed). Used everywhere in the UI; real name shown only on the Participant detail view and only to logged-in users.
- **Admin** — a User role that confirms Registrations, populates Knockout fixtures, and enters Scores. An Admin can also be a Participant.
- **Registration** — sign-up record (name, alias, email + entry fee payment). Status: `PENDING` → `CONFIRMED`. Confirmation is manual (Admin marks it after verifying payment).
- **Stage** — a tournament phase containing a fixed set of Matches. The seven stages in order: Group Stage · Round of 32 · Round of 16 · Quarter-Finals · Semi-Finals · Third-Place Play-off · Final.
- **Match** — a scheduled game between two teams, belonging to one Stage. Has a `scheduledAt` timestamp, an optional Score, and Predictions.
- **Score** — the actual match result entered by an Admin (goals + ET/penalties for Knockout). Never call it "result" or "outcome" in code. Distinct from **Points** (a Participant's accumulated total).
- **Prediction** — a Participant's forecast for one Match (goals, and for Knockout: ET flag + optional penalty winner). Never call it a "pick", "bet", or "guess".
- **Prediction Window** — open from when a Stage's Matches are populated until the `scheduledAt` of the Stage's first Match. Within the window, Predictions are freely created/edited. After it closes, nothing can be changed. Deadline is driven by fixture data — never by admin action.
- **Points** — earned per Match after a Score is entered. Missing Prediction = 0 for that Match only. No Stage-level penalty for incomplete submissions.
- **Leaderboard** — ranked by total Points descending. Ties share rank; no tiebreaker. Publicly accessible (no login); real names only on the Participant detail view for logged-in users.

### Scoring rules

**Group Stage** (max 3 pts/match)

| Condition | Pts |
|---|---|
| Correct result (win / draw / win) | 2 |
| Correct exact score | +1 |

**Knockout Stage** (max 4 pts for non-tie prediction · 5 pts for tie prediction)

| Condition | Pts |
|---|---|
| Non-tie prediction: predicted team is overall match winner | 2 |
| Tie prediction: match goes to shootout AND predicted penalty winner wins | 2 |
| Correct exact final score (after ET if applicable) | +1 |
| Correct ET prediction (yes/no) | +1 |
| Tie prediction only: shootout happened AND predicted winner wins | +1 |

> **Critical knockout scoring nuance**: a non-tie prediction earns 2 pts as long as the predicted team wins — regardless of whether ET or penalties were involved. The ET and Shootout bonus points are completely independent. The shootout bonus (+1) only applies to tie-score predictions and combines "did shootouts happen?" with "did my predicted winner win?" into a single check.

### Prediction Window edge cases

- A Participant confirmed after the Group Stage window closed earns 0 for Group Stage but can predict all future Knockout stages.
- Predictions are hidden from all other Participants until the Stage's window closes (first match starts). After that, everyone's predictions become visible.

### Score correction

A Score can be corrected by an Admin within 30 minutes of entry (`lockedAt` is null during this window). After 30 minutes the Score is immutable. Points are recalculated automatically on correction.

## Backend (`apps/backend`)

- **Framework**: NestJS with strict TypeScript
- **ORM**: Prisma — schema at `apps/backend/prisma/schema.prisma`
- **Database**: PostgreSQL
- **Auth**: Passport + JWT — 30-minute access token (in response body, stored in memory on client), refresh token in httpOnly cookie
- **Validation**: `class-validator` pipes on all controllers
- **Config**: `@nestjs/config` with `.env` — never hardcode secrets

Module structure: one folder per feature (`auth`, `users`, `stages`, `matches`, `predictions`, `scores`, `leaderboard`, `admin`). Each module owns its Prisma calls — no shared repository layer.

### Key backend rules
- Points calculated **synchronously** when an Admin enters a Score — no queue, no cron
- Prediction Window enforced in the **service layer** against `scheduledAt` of the stage's first Match — not in Prisma schema
- Prediction visibility enforced in **query filters** — only the owning Participant sees their Predictions while the window is open

## Frontend (`apps/frontend`)

- **Routing**: TanStack Router (file-based routes under `src/routes/`)
- **Data fetching**: TanStack Query — all API calls through hooks in `src/api/`
- **UI**: Mantine v7 — prefer Mantine components over raw HTML
- **Forms**: `@mantine/form`
- **Tables**: TanStack Table
- **Auth state**: access token in React context (in-memory); refresh via httpOnly cookie on page load

### Key frontend rules
- Public routes (leaderboard, stage/match list): no login required
- Alias everywhere — real name only on Participant detail view, only when logged in
- Datetimes arrive as ISO UTC strings; display in user's local timezone via `Intl.DateTimeFormat` — never hardcode an offset

## Shared types (`packages/types`)

All API request/response shapes live in `packages/types/src/index.ts`. When adding or changing an endpoint: update types first, then implement backend and frontend. Never duplicate type definitions across apps.

## Docker

`docker compose up --build` from the repo root is the golden path. It starts PostgreSQL, the NestJS backend, and the nginx-served frontend in the correct order. On the first run the backend entrypoint (`docker/backend/entrypoint.sh`) runs `prisma db push` (schema sync, idempotent) and then seeds the database; subsequent runs skip the seed via a flag file in the `seed_flag` named volume.

Key files:
- `docker-compose.yaml` — orchestrates all three services
- `docker/backend/Dockerfile` — single-stage `node:20-alpine` build (dev deps kept for `ts-node` seed)
- `docker/backend/entrypoint.sh` — schema sync → conditional seed → `node dist/main`
- `docker/frontend/Dockerfile` — multi-stage: Vite build in `node:20-alpine`, served by `nginx:alpine`
- `docker/frontend/nginx.conf` — proxies `/api` to `backend:3000`, falls back all other paths to `index.html`

The nginx proxy means the browser never makes cross-origin requests, so CORS is not a concern in the Docker setup. The `FRONTEND_URL` env var on the backend is still set to `http://localhost:5173` to cover any direct-API access.

There are no Prisma migration files in the repo yet. `prisma db push` is used instead of `prisma migrate deploy`. When the project moves to production, create a proper initial migration with `pnpm --filter backend prisma:migrate` and switch the entrypoint to `prisma migrate deploy`.

## Database commands

```bash
pnpm --filter backend prisma:migrate   # run migrations
pnpm --filter backend seed             # seed admin + WC 2026 fixtures
pnpm --filter backend prisma:studio    # open Prisma Studio
pnpm --filter backend prisma:generate  # regenerate client after schema changes
```

The seed script (`prisma/seed.ts`) is the source of truth for WC 2026 fixture data. Do not fetch fixtures from external APIs at runtime.

## Workflow

For every new initiative (feature, refactor, ADR change): create a dedicated branch, implement, then open a PR. Never commit directly to `main`.

## Architecture Decision Records

Each ADR records a decision that is hard to reverse, surprising without context, or the result of a real trade-off. Read the relevant file before changing anything in its area.

| # | File | Decision |
|---|---|---|
| 0001 | [prisma-over-typeorm](docs/adr/0001-prisma-over-typeorm.md) | Chose Prisma over TypeORM (NestJS default) for stronger type safety and reliable migrations |
| 0002 | [score-30-minute-correction-window](docs/adr/0002-score-30-minute-correction-window.md) | Scores editable for 30 min after entry then immutable — balances typo recovery vs. result manipulation |
| 0003 | [predictions-hidden-until-window-closes](docs/adr/0003-predictions-hidden-until-window-closes.md) | Predictions hidden from other Participants until the Stage window closes — prevents copying |
| 0004 | [nestjs-backend-stack](docs/adr/0004-nestjs-backend-stack.md) | NestJS chosen over plain Express/Fastify for module system, DI, and first-class ecosystem |
| 0005 | [react-vite-mantine-tanstack-frontend](docs/adr/0005-react-vite-mantine-tanstack-frontend.md) | Vite SPA (not Next.js) + Mantine + TanStack Router/Query/Table — no SSR needed, strong TS routing |
| 0006 | [pnpm-workspaces-monorepo](docs/adr/0006-pnpm-workspaces-monorepo.md) | pnpm workspaces monorepo so type changes in `packages/types` are caught at compile time across both apps |
| 0007 | [synchronous-points-calculation](docs/adr/0007-synchronous-points-calculation.md) | Points calculated synchronously on score entry — no queue needed at ≤200 participants |
| 0008 | [jwt-in-memory-plus-httponly-refresh](docs/adr/0008-jwt-in-memory-plus-httponly-refresh.md) | Access token in localStorage (5 min TTL) + refresh token in httpOnly SameSite=Lax cookie — no reload flicker |
| 0009 | [vercel-supabase-deployment](docs/adr/0009-vercel-supabase-deployment.md) | Frontend + NestJS serverless function on Vercel, Postgres on Supabase — same origin, zero ops |
