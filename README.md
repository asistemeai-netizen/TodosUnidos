# Todos Unidos

Plataforma centralizada de búsqueda y unificación de personas desaparecidas en Venezuela, construida para coordinar datos entre múltiples organizaciones aliadas durante emergencias.

## ¿Qué hace?

- **Directorio unificado** de personas desaparecidas, localizadas y fallecidas
- **Deduplicación automática** de registros provenientes de distintas plataformas mediante fuzzy matching
- **Feed de noticias con IA** — resúmenes generados por Google Gemini cada hora desde fuentes venezolanas
- **Centros de acopio** — directorio de puntos de recolección y donación
- **API pública para partners** — webhooks y endpoints REST para organizaciones aliadas
- **Panel de administración** con métricas, revisión de duplicados y gestión de API keys

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16 · React 19 · Tailwind CSS |
| Backend | Hono.js · Node.js |
| Base de datos | PostgreSQL · Drizzle ORM |
| Storage | MinIO (S3-compatible) |
| IA | Google Gemini (`gemini-3.1-flash-lite-preview`) |
| Monorepo | pnpm workspaces |

## Estructura

```
todosunidos/
├── apps/
│   ├── api/       # API REST + webhooks + cron de noticias
│   └── web/       # Sitio público + panel admin
└── packages/
    └── db/        # Schema compartido (Drizzle ORM)
```

## Requisitos

- Node.js >= 20
- pnpm >= 8
- PostgreSQL (ver variables de entorno)
- MinIO o bucket S3 compatible

## Instalación

```bash
pnpm install
```

## Variables de entorno

### `apps/api/.env`
```env
GEMINI_API_KEY=
SEARXNG_URL=
SEARXNG_USERNAME=
SEARXNG_PASSWORD=
MINIO_ENDPOINT=
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET=
```

### `apps/web/.env.local`
```env
DATABASE_URL=
MINIO_ENDPOINT=
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET=
ADMIN_PASSWORD=
```

### `.env` (raíz)
```env
DATABASE_URL=
```

## Desarrollo

```bash
# Correr todo en paralelo
pnpm dev

# Solo la API (puerto 3001)
cd apps/api && npm run dev

# Solo el frontend (puerto 3000)
cd apps/web && npm run dev
```

## Base de datos

```bash
# Generar migraciones
cd packages/db && npm run generate

# Aplicar schema
cd packages/db && npm run push
```

## Despliegue

```bash
pnpm build
```

Cada app se puede desplegar de forma independiente. La API es un servidor Node.js estándar; el frontend es una app Next.js compatible con cualquier proveedor que soporte SSR.

## Schema de base de datos

| Tabla | Descripción |
|-------|-------------|
| `platforms` | Organizaciones aliadas autorizadas |
| `unifiedPersons` | Registro maestro unificado por persona |
| `platformReports` | Reportes crudos de cada plataforma |
| `potentialDuplicates` | Cola de duplicados para revisión humana |
| `newsSummaries` | Resúmenes de noticias generados por IA |
| `collectionCenters` | Centros de acopio y donación |
| `personTips` | Información aportada por la comunidad |
| `apiKeys` | Credenciales para partners |
| `webhooks` | Suscripciones a eventos por partner |

## API para partners

Autenticación mediante header `x-api-key`.

```
POST /api/v1/personas        # Reportar persona
GET  /api/v1/personas        # Consultar directorio
POST /api/v1/webhooks        # Registrar webhook
```

Los webhooks reciben eventos en tiempo real cuando se crea o actualiza una persona.

## Licencia

Proyecto de respuesta humanitaria — todos los derechos reservados © Asisteme.
