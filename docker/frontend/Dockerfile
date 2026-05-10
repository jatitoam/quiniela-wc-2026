FROM node:20-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm@9

# Copy workspace manifests for layer caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/frontend/package.json ./apps/frontend/
COPY apps/backend/package.json ./apps/backend/
COPY packages/types/package.json ./packages/types/

RUN pnpm install --frozen-lockfile

# Copy source after install
COPY apps/frontend ./apps/frontend
COPY packages/types ./packages/types

# Build the SPA — no VITE_API_URL needed; nginx proxies /api at runtime
RUN pnpm --filter frontend build

# ─── Serve ────────────────────────────────────────────────────────────────────
FROM nginx:alpine
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
