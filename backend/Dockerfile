# ---------- Stage 1: Build ----------
FROM node:22-alpine AS builder

WORKDIR /app

# Install all deps (including dev) for prisma generate + nest build
COPY package.json package-lock.json ./
RUN npm ci

# Prisma needs the schema + config to generate the client
COPY prisma ./prisma
COPY prisma7.config.ts ./
COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY src ./src

# The generated client is gitignored, so generate it here before compiling
RUN npx prisma generate
RUN npm run build

# ---------- Stage 2: Runtime ----------
FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

# dumb-init gives Node proper signal handling as PID 1
RUN apk add --no-cache dumb-init

# prisma/dotenv/tsx are in dependencies, so --omit=dev keeps them for
# `migrate deploy` + `db seed` at startup
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy built app + Prisma assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma7.config.ts ./

EXPOSE 10000

USER node

# Render injects PORT. Migrate (idempotent) + seed reference data, then
# optionally provision the admin (ADMIN_EMAIL/ADMIN_PASSWORD) if set, then boot.
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && if [ -n \"$ADMIN_EMAIL\" ] && [ -n \"$ADMIN_PASSWORD\" ]; then npx tsx prisma/seed-admin.ts; fi && node dist/main"]
