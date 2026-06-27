FROM node:20-alpine AS base

FROM base AS builder
# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@9 --activate
# Alpine base necesita libc6-compat a veces
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copiar configuración de monorepo
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
# Copiar el paquete compartido
COPY packages/db ./packages/db
# Copiar la aplicación web
COPY apps/web ./apps/web

# Instalar dependencias (con devDependencies necesarias para compilar Next y Drizzle)
RUN pnpm install --frozen-lockfile=false

# Compilar el frontend web
WORKDIR /app/apps/web
# Pasamos el ADMIN_PASSWORD como ARG si se requiere en build time, o Next lo ignora si no tiene NEXT_PUBLIC_
RUN pnpm build

# Producción
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Copiar la salida standalone y estática generada por next build
# Next.js standalone mueve todo a /app/apps/web/.next/standalone pero 
# la estructura del monorepo se mantiene
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/.next/standalone ./

EXPOSE 3000

# El output standalone de Next.js incluye node_modules y el server.js listo para correr
# Y la ruta en standalone será apps/web/server.js
CMD ["node", "apps/web/server.js"]
