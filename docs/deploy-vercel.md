# Deployment Guide — Vercel (frontend) + Railway (backend + Postgres)

Both services connect via a public HTTPS URL. The frontend calls the Railway backend directly; Railway hosts Postgres in the same private network as the NestJS app.

---

## Prerequisites

- GitHub repository pushed (already done on `main`)
- [Vercel account](https://vercel.com) linked to GitHub
- [Railway account](https://railway.app) linked to GitHub
- `pnpm` installed locally (for running migrations)

---

## Step 1 — Provision Postgres on Railway

1. Go to [railway.app/new](https://railway.app/new) → **Deploy from template** → choose **PostgreSQL**.
2. Railway creates a Postgres service. Click it → **Variables** tab → copy the `DATABASE_URL` value (format: `postgresql://...`). You will need this in Steps 2 and 3.

---

## Step 2 — Deploy the backend on Railway

1. In the same Railway project, click **+ New** → **GitHub Repo** → select this repository.
2. Railway will detect the monorepo. Set the following under **Settings → Build & Deploy**:

   | Setting | Value |
   |---|---|
   | Root directory | `apps/backend` |
   | Build command | `pnpm install && pnpm build` |
   | Start command | `node dist/main` |

3. Under **Variables**, add:

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | *(paste from Step 1)* |
   | `JWT_SECRET` | *(random 64-char string)* |
   | `JWT_REFRESH_SECRET` | *(different random 64-char string)* |
   | `JWT_EXPIRES_IN` | `30m` |
   | `JWT_REFRESH_EXPIRES_IN` | `30d` |
   | `SCORE_LOCK_MINUTES` | `30` |
   | `PORT` | `3000` |
   | `FRONTEND_URL` | *(your Vercel URL — add after Step 4; use `*` temporarily)* |

4. Click **Deploy**. Wait for the build to succeed. Note the public URL Railway assigned (e.g., `https://ih-quiniela-wc-2026-production.up.railway.app`).

---

## Step 3 — Run database migrations and seed

Run these locally, pointed at the Railway Postgres instance.

```bash
# Substitute the Railway DATABASE_URL from Step 1
export DATABASE_URL="postgresql://..."

cd apps/backend

# Create schema
pnpm prisma migrate deploy

# Seed: creates admin user + all WC 2026 fixtures
SEED_ADMIN_EMAIL=admin@yourdomain.com \
SEED_ADMIN_PASSWORD=YourSecurePassword1! \
pnpm seed
```

> The seed script is idempotent for fixtures (upserts teams/groups/stages/matches). Re-running it will not duplicate data. The admin user is created only if the email doesn't already exist.

---

## Step 4 — Deploy the frontend on Vercel

1. Go to [vercel.com/new](https://vercel.com/new) → **Import Git Repository** → select this repository.
2. Vercel may auto-detect the monorepo. Set:

   | Setting | Value |
   |---|---|
   | Framework preset | **Vite** |
   | Root directory | `apps/frontend` |
   | Build command | `pnpm build` |
   | Output directory | `dist` |
   | Install command | `pnpm install` |

3. Under **Environment Variables**, add:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://<your-railway-url>/api` *(from Step 2, append `/api`)* |

4. Click **Deploy**. Vercel will build and publish. Note the assigned URL (e.g., `https://ih-quiniela.vercel.app`).

---

## Step 5 — Wire CORS on the backend

Go back to Railway → backend service → **Variables** → update:

```
FRONTEND_URL=https://ih-quiniela.vercel.app
```

Trigger a redeploy (Railway redeploys automatically on variable changes).

---

## Step 6 — Verify

1. Open the Vercel URL → you should see the leaderboard (empty at first).
2. Click **Register** → create an account.
3. Log in as admin (`admin@yourdomain.com`) → go to **Admin → Registrations** → confirm the account.
4. Log in with the new account → go to **My Predictions** → group stage window should be open.

---

## Custom domain (optional)

- **Vercel:** Project → **Settings → Domains** → add your domain.
- **Railway:** Service → **Settings → Networking → Public Networking** → add a custom domain.
- Update `FRONTEND_URL` on Railway to match the custom domain after adding it.

---

## Redeployments

| What changed | Action |
|---|---|
| Frontend code | Push to `main` — Vercel auto-deploys |
| Backend code | Push to `main` — Railway auto-deploys |
| Schema change | Run `pnpm prisma migrate deploy` locally with `DATABASE_URL` set |
| Seed data change | Re-run `pnpm seed` (safe to re-run) |
