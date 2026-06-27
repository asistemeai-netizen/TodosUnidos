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
COPY apps/mcp ./apps/mcp

# Instalar TODO (dependencias y devDependencies) para poder compilar y transpirar TypeScript
RUN pnpm install --frozen-lockfile=false

# Compilar MCP (Opcional si usamos tsx)
WORKDIR /app/apps/mcp
RUN pnpm build || true

# Fase de Producción
FROM base AS runner
WORKDIR /app

# Solo copiamos el entorno de ejecución
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

COPY --from=builder /app/packages/db/package.json ./packages/db/
COPY --from=builder /app/packages/db/src ./packages/db/src

COPY --from=builder /app/apps/mcp/package.json ./apps/mcp/
COPY --from=builder /app/apps/mcp/src ./apps/mcp/src
COPY --from=builder /app/apps/mcp/node_modules ./apps/mcp/node_modules

EXPOSE 3002

ENV NODE_ENV=production

WORKDIR /app/apps/mcp
CMD ["npx", "tsx", "src/index.ts"]
