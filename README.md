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
docs/
  adr/         Architecture Decision Records
CONTEXT.md     Domain language & scoring rules
```

## Getting started

### Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9 (`npm install -g pnpm`)
- PostgreSQL (or use Railway locally via `railway run`)

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
pnpm --filter backend prisma:migrate   # run migrations
pnpm --filter backend seed             # seed admin + WC 2026 fixtures
```

### Develop

```bash
pnpm dev   # runs backend + frontend in parallel
```

Backend runs on `http://localhost:3000`, frontend on `http://localhost:5173`.

## Architecture decisions

See [`docs/adr/`](./docs/adr/) for all recorded decisions.
