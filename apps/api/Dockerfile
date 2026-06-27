FROM node:20-alpine AS base

FROM base AS builder
# Habilitar pnpm
RUN corepack enable && corepack prepare pnpm@9 --activate
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Archivos raíz del workspace
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
# Carpetas involucradas
COPY packages/db ./packages/db
COPY apps/api ./apps/api

# Instalar TODO (dependencias y devDependencies) para poder compilar y transpirar TypeScript
RUN pnpm install --frozen-lockfile=false

# Compilar API
WORKDIR /app/apps/api
RUN pnpm build

# Limpiar devDependencies para producción (excepto tsx que lo usaremos para ejecutar)
# Como es monorepo y no estamos usando esbuild, tsx es lo más seguro para resolver el workspace
WORKDIR /app
# No hacemos prune completo para mantener tsx y typescript, o lo ejecutamos directo
# RUN pnpm prune --prod

# Fase de Producción
FROM base AS runner
WORKDIR /app

# Solo copiamos el entorno de ejecución
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

COPY --from=builder /app/packages/db/package.json ./packages/db/
COPY --from=builder /app/packages/db/drizzle.config.ts ./packages/db/
COPY --from=builder /app/packages/db/src ./packages/db/src

COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

EXPOSE 3001

ENV NODE_ENV=production

WORKDIR /app/apps/api
# Auto-migrar base de datos y luego arrancar la API
CMD ["sh", "-c", "cd /app/packages/db && npx drizzle-kit push:pg && cd /app/apps/api && npx tsx src/index.ts"]
