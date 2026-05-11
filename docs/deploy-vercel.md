# Deployment Guide — Vercel + Supabase

Frontend SPA and NestJS backend (Serverless Function) deploy to a single Vercel project. Supabase provides the managed Postgres database. Both run on the same origin, which keeps the refresh-token cookie same-site.

---

## Prerequisites

- GitHub repository pushed (already done on `main`).
- [Vercel account](https://vercel.com) linked to GitHub.
- [Supabase account](https://supabase.com).
- `pnpm` installed locally — needed to run the schema push and seed from your machine.

---

## Step 1 — Provision Supabase Postgres

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.
2. Choose a name (e.g., `quiniela-wc-2026`), region, and a strong database password. Save the password somewhere safe.
3. Wait for the project to spin up (~1 minute).
4. In the left sidebar go to **Settings → Database → Connection string**.
5. Copy two URLs — you will need both:

   | URL | Where to find it | Used for |
   |---|---|---|
   | **Pooled URL** | "Transaction" mode, port **6543** | Runtime `DATABASE_URL` (Vercel function) |
   | **Direct URL** | "Direct connection", port **5432** | `DIRECT_URL` — schema push + seed from local |

   The pooled URL includes `?pgbouncer=true` in some Supabase UI versions. If it doesn't, append `?pgbouncer=true&connection_limit=1` manually.

---

## Step 2 — Push schema and seed from local

This step only needs to run once (or after schema changes). The seed is idempotent — re-running it is safe.

```bash
# From the repo root
cd apps/backend

export DATABASE_URL="postgresql://postgres.xxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
export DIRECT_URL="postgresql://postgres.xxxx:[YOUR-PASSWORD]@aws-0-us-east-1.supabase.com:5432/postgres"

# Push the Prisma schema to Supabase (idempotent)
pnpm exec prisma db push

# Seed: creates admin user + all WC 2026 fixtures
SEED_ADMIN_EMAIL=admin@yourdomain.com \
SEED_ADMIN_PASSWORD='YourSecurePassword1!' \
pnpm seed
```

> The admin password is only set on the first run. Re-running seed with a different password has no effect. To change the admin password later, update it directly in Supabase's Table Editor or via Prisma Studio.

---

## Step 3 — Import the repo into Vercel

1. Go to [vercel.com/new](https://vercel.com/new) → **Import Git Repository** → select this repository.
2. On the configuration screen:
   - **Framework Preset**: select **Other** (the `vercel.json` at the repo root drives everything).
   - Leave Root Directory, Build Command, and Output Directory blank — they are all set in `vercel.json`.
3. Do **not** deploy yet. Add environment variables first (Step 4).

---

## Step 4 — Set environment variables on Vercel

In the Vercel project → **Settings → Environment Variables**, add these for **Production** and **Preview**:

| Key | Value |
|---|---|
| `DATABASE_URL` | Pooled URL from Step 1 (port 6543) |
| `DIRECT_URL` | Direct URL from Step 1 (port 5432) |
| `JWT_SECRET` | Random 64-character string (use `openssl rand -hex 32`) |
| `JWT_REFRESH_SECRET` | Different random 64-character string |
| `JWT_EXPIRES_IN` | `5m` |
| `JWT_REFRESH_EXPIRES_IN` | `30d` |
| `SCORE_LOCK_MINUTES` | `30` |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | Your Vercel project URL (e.g., `https://quiniela.vercel.app`) — used for CORS |

> `DIRECT_URL` is read by `prisma generate` at build time (needed for the schema) but not used at runtime by the Serverless Function.

---

## Step 5 — Deploy

1. In the Vercel project, click **Deploy** (or push a commit to `main` — Vercel auto-deploys).
2. Watch the build log. Expected sequence:
   - `pnpm install`
   - `pnpm --filter @quiniela/types build`
   - `pnpm --filter backend vercel-build` → runs `prisma generate && nest build`
   - `pnpm --filter frontend build` → Vite build
3. When the deployment finishes, Vercel shows your production URL.

---

## Step 6 — Verify

1. Open the Vercel URL → the leaderboard should load (empty at first).
2. Click **Register** → fill in the form and submit.
3. Log in as the admin user seeded in Step 2.
4. Go to **Admin → Registrations** → confirm the new account.
5. Log out, log back in as the new user.
6. Go to **My Predictions** → the Group Stage prediction window should be open.
7. Leave the tab open for 5+ minutes, then click anything. The app should silently refresh the access token without logging you out. Check the Network tab in DevTools — you should see a `POST /api/auth/refresh` request complete with 200.
8. Log out → check DevTools **Application → Cookies**: the `refresh_token` cookie should be gone.

---

## Step 7 — Custom domain (optional)

1. In the Vercel project → **Settings → Domains** → add your domain and follow the DNS instructions.
2. Update the `FRONTEND_URL` environment variable in Vercel to match the new domain (for CORS).
3. Trigger a redeploy (push a trivial commit, or use Vercel's **Redeploy** button).

No backend changes are needed — the API stays at `<your-domain>/api/...`.

---

## Redeployments

| Trigger | Action |
|---|---|
| Frontend or backend code change | Push to `main` — Vercel auto-deploys |
| Schema change | Run `prisma db push` locally with `DIRECT_URL` set, then deploy |
| Seed data change | Re-run `pnpm seed` locally (idempotent — safe) |
| Env var change | Update in Vercel Settings → triggers an automatic redeploy |

---

## Troubleshooting

**First request is slow (3–5 s).**
Cold-start latency on the Serverless Function. Normal after the function has been idle. Subsequent requests are fast. If unacceptable, consider a synthetic warm-up ping or upgrade to Vercel Pro for faster cold starts.

**"Too many connections" error in the logs.**
The `DATABASE_URL` is pointing at the direct connection (port 5432) instead of the Supavisor pooler (port 6543). Fix: confirm `DATABASE_URL` in Vercel uses port 6543 with `?pgbouncer=true&connection_limit=1`.

**401 every 5 minutes, not recovering.**
The refresh flow is broken. Check DevTools **Application → Cookies** and confirm the `refresh_token` cookie shows `Path: /api/auth/refresh`. If the path is wrong, a backend deploy is needed with the corrected cookie config.

**Build fails with Prisma binary error.**
Confirm `schema.prisma` includes `binaryTargets = ["native", "rhel-openssl-3.0.x"]` in the `generator client` block.

**CORS error in the browser console.**
Confirm `FRONTEND_URL` in Vercel matches the exact origin making the request (including the protocol, no trailing slash). Under same-origin Vercel deployment this should not occur; it would indicate a custom-domain mismatch.
