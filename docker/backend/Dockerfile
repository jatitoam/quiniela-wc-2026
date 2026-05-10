FROM node:20-alpine
WORKDIR /app

RUN npm install -g pnpm@9

# Copy workspace manifests first for layer caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/types/package.json ./packages/types/
# Copy Prisma schema before install so @prisma/client postinstall can generate the client
COPY apps/backend/prisma ./apps/backend/prisma

RUN pnpm install --frozen-lockfile

# Generate Prisma client explicitly — the postinstall hook may not find the schema
# because it runs from the pnpm virtual store context, not the backend package root.
RUN cd /app/apps/backend && npx prisma generate

# Copy source after install to keep the install layer cached
COPY apps/backend/src ./apps/backend/src
COPY apps/backend/tsconfig.json ./apps/backend/
COPY apps/backend/tsconfig.build.json ./apps/backend/
COPY apps/backend/nest-cli.json ./apps/backend/
COPY packages/types ./packages/types

RUN pnpm --filter backend build

EXPOSE 3000

COPY docker/backend/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
