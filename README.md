# IH Quiniela WC 2026

Company-internal WC 2026 prediction pool. Participants pay an entry fee, submit match predictions before each stage locks, and earn points based on accuracy. See [CLAUDE.md](./CLAUDE.md) for the domain model and conventions.

## Stack

| Layer | Technology |
|---|---|
| Backend | NestJS · Prisma · PostgreSQL |
| Frontend | React · Vite · Mantine · TanStack (Query, Router, Forms, Tables) |
| Monorepo | pnpm workspaces |
| Deployment | Vercel (frontend) · Railway (backend + Postgres) |

## Monorepo layout

```
apps/
  backend/     NestJS API
  frontend/    React + Vite SPA
packages/
  types/       Shared TypeScript types (DTOs, enums)
docker/
  backend/     Dockerfile + entrypoint for the NestJS service
  frontend/    Dockerfile (Vite build) + nginx config
docs/
  adr/         Architecture Decision Records
```

## One-click setup (Docker)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker + Docker Compose v2).

```bash
docker compose up --build
```

That single command:

1. Starts a PostgreSQL 17 container and waits until it is healthy.
2. Builds and starts the NestJS backend — syncs the schema (`prisma db push`) and, **on the very first run**, seeds the admin user and all WC 2026 fixture data.
3. Builds the React SPA with Vite and serves it via nginx.

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000/api |

The nginx container proxies all `/api` requests to the backend, so the browser never makes cross-origin calls.

**Subsequent runs** (`docker compose up`) skip the seed — a flag file persisted in the `seed_flag` volume prevents it from running again. The schema sync (`prisma db push`) still runs on every startup and is idempotent.

**Reset everything** (wipe DB + re-seed):

```bash
docker compose down -v   # removes volumes
docker compose up
```

## Local development (without Docker)

### Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9 (`npm install -g pnpm`)
- PostgreSQL running locally (or via `railway run`)

### Install

```bash
pnpm install
```

### Environment

```bash
cp apps/backend/.env.example apps/backend/.env
# fill in DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET
```

### Database

```bash
pnpm --filter backend prisma:migrate   # create + apply migration
pnpm --filter backend seed             # seed admin + WC 2026 fixtures
```

### Develop

```bash
pnpm dev   # runs backend + frontend in parallel
```

Backend on `http://localhost:3000`, frontend on `http://localhost:5173`.

## Architecture decisions

See [`docs/adr/`](./docs/adr/) for all recorded decisions.
