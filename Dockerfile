# Meridiana API — Dockerfile multi-stage para pnpm monorepo.
# Funciona em Fly.io, Render, Railway (builder=DOCKERFILE), Cloud Run, etc.
# Build: docker build -t meridiana-api .
# Run:   docker run -p 3001:3001 -e DB_MODE=memory meridiana-api

# ---------- Stage 1: deps ----------
FROM node:22-alpine AS deps
WORKDIR /app
RUN npm install -g pnpm@10.28.2

# Copia manifestos primeiro (otimiza cache Docker)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/ai-router/package.json ./packages/ai-router/
COPY packages/pii-redactor/package.json ./packages/pii-redactor/

# Ignora apps/web (não precisa na API) - criamos package.json mínimo
RUN mkdir -p apps/web && echo '{"name":"@meridiana/web","version":"0.0.1"}' > apps/web/package.json

RUN pnpm install --frozen-lockfile

# ---------- Stage 2: build ----------
FROM node:22-alpine AS build
WORKDIR /app
RUN npm install -g pnpm@10.28.2
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages ./packages

COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api ./apps/api
COPY packages ./packages

# Build packages + api (topological order via pnpm filter)
RUN pnpm --filter "@meridiana/api..." build

# ---------- Stage 3: runtime ----------
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
# Default: modo demo sem Postgres. Troque para DB_MODE=prisma + DATABASE_URL em produção real.
ENV DB_MODE=memory

# Non-root user (segurança)
RUN addgroup -S meridiana && adduser -S meridiana -G meridiana

COPY --from=build --chown=meridiana:meridiana /app/node_modules ./node_modules
COPY --from=build --chown=meridiana:meridiana /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build --chown=meridiana:meridiana /app/apps/api/dist ./apps/api/dist
COPY --from=build --chown=meridiana:meridiana /app/apps/api/package.json ./apps/api/
COPY --from=build --chown=meridiana:meridiana /app/packages ./packages
COPY --from=build --chown=meridiana:meridiana /app/package.json ./

USER meridiana

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:${PORT}/health || exit 1

CMD ["node", "apps/api/dist/server.js"]
