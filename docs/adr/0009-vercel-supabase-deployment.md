# Vercel + Supabase deployment

Frontend static files and NestJS backend (as a Serverless Function) deploy to a single Vercel project. Supabase provides the managed PostgreSQL database.

## Decision

Both the frontend SPA (Vite build) and the NestJS API (wrapped with `@vendia/serverless-express`) are deployed under the same Vercel project, on the same origin. Supabase Postgres is the database. Railway was removed from consideration.

## Rationale

**Why Vercel for the backend, not a separate host.**
Deploying NestJS as a Vercel Serverless Function places the API on the same domain as the frontend (e.g., `quiniela.vercel.app/api/*`). This makes the refresh-token cookie same-site by construction, so `SameSite=Lax` works without any cross-site cookie negotiation. Hosting the backend on a separate service (Railway, Render, Fly.io) would put it on a different origin and require `SameSite=None; Secure` — which Safari blocks for third-party cookies under ITP, introducing a hard session-management failure mode.

**Why serverless works here.**
- No cron jobs: `@nestjs/schedule` is a dependency but unused. Points are calculated synchronously on score entry (ADR 0007), so no background worker is needed.
- Load is low (≤200 participants). Cold-start latency (~1–3 s on first hit after idle) is acceptable for an internal pool.
- Prisma works in serverless via Supabase's Supavisor pooler (PgBouncer-compatible, transaction mode, port 6543). Runtime `DATABASE_URL` uses the pooled URL; `prisma db push` and seed use the direct URL (`DIRECT_URL`, port 5432).

**Why Supabase, not a self-managed Postgres.**
Managed Postgres on Supabase ships with Supavisor (the pooler required for serverless Prisma), automatic backups, and a monitoring dashboard — zero ops overhead. Only Postgres is used from Supabase; Supabase Auth and Storage are not used.

**What changed from the original ADR 0009 (Vercel + Railway).**
Railway would have required the frontend to call a cross-origin Railway URL, forcing `SameSite=None`, a separate CORS configuration, and a Railway account. With both apps on Vercel, the architecture collapses to one platform and one `vercel.json` at the repo root.

## Consequences

- Vercel Serverless Function timeout: 30 s (set in `vercel.json`). Sufficient for all current operations; score entry with point calculation is the most expensive path.
- If the app ever needs background jobs (e.g., auto-locking scores, sending reminders), the serverless model requires a queue or an external cron caller. That would be the trigger to revisit this decision.
- Schema changes must be applied locally against the Supabase direct URL before deploying code that requires them. There is no automatic migration on deploy.

## Deployment instructions

See `docs/deploy-vercel.md` for a step-by-step runbook.
