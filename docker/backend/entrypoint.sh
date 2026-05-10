#!/bin/sh
set -e

# Push schema to DB (idempotent — safe on every startup, no migration files required)
echo "→ Syncing database schema..."
pnpm --filter backend exec prisma db push --accept-data-loss

# Seed only on the first run (flag survives container restarts via named volume)
if [ ! -f /data/.seeded ]; then
  echo "→ Seeding database (first run)..."
  pnpm --filter backend seed
  touch /data/.seeded
  echo "→ Seed complete."
fi

echo "→ Starting backend..."
exec node /app/apps/backend/dist/src/main
