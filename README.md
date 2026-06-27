# Todos Unidos

Plataforma centralizada de búsqueda y unificación de personas desaparecidas en Venezuela, construida para coordinar datos entre múltiples organizaciones aliadas durante emergencias.

## ¿Qué hace?

- **Directorio unificado** de personas desaparecidas, localizadas y fallecidas
- **Deduplicación automática** con IA — Gemini analiza registros cada 6 horas y marca posibles duplicados para revisión humana
- **Feed de noticias con IA** — resúmenes generados por Gemini cada 20 minutos desde fuentes venezolanas (SearxNG + RSS)
- **Monitoreo de YouTube con IA** — extracción y moderación automática de videos relevantes a la emergencia cada 30 minutos
- **Centros de acopio** — directorio de puntos de recolección y donación
- **Moderación de tips ciudadanos** — Gemini filtra spam e insultos; el admin revisa los rechazados
- **API pública para partners** — webhooks y endpoints REST para organizaciones aliadas
- **Servidor MCP** — permite a herramientas de IA (Claude, Cursor, etc.) consultar la base de datos en tiempo real
- **Panel de administración** con métricas, revisión de duplicados, gestión de canales YouTube y API keys

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16 · React 19 · Tailwind CSS |
| Backend | Hono.js · Node.js |
| MCP | Express · SSE (Server-Sent Events) |
| Base de datos | PostgreSQL · Drizzle ORM · `pg_trgm` (fuzzy matching) |
| Storage | MinIO (S3-compatible, auto-provisioning de bucket) |
| IA | Google Gemini 2.5 Flash / 3.1 Flash Lite |
| Monorepo | pnpm workspaces |

## Estructura

```
todosunidos/
├── apps/
│   ├── api/       # API REST + webhooks + crons (noticias, YouTube, deduplicación)
│   ├── web/       # Sitio público + panel admin (Next.js)
│   └── mcp/       # Servidor MCP para herramientas de IA
└── packages/
    └── db/        # Schema compartido (Drizzle ORM)
```

## Requisitos

- Node.js >= 20
- pnpm >= 8
- PostgreSQL con extensión `pg_trgm`
- MinIO o bucket S3 compatible
- Google Gemini API key
- YouTube Data API key

## Instalación

```bash
pnpm install
```

## Variables de entorno

> [!NOTE]
> Para despliegue en producción (Dokploy / Docker Compose), las variables se consolidan a nivel raíz. Ver `docker-compose.yml`.

### Variables globales (producción)

```env
DATABASE_URL=
ADMIN_PASSWORD=
GEMINI_API_KEY=
SEARXNG_URL=
SEARXNG_USER=
SEARXNG_PASSWORD=
YOUTUBE_API_KEY=
MINIO_ENDPOINT=
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
```

> `MINIO_BUCKET` es opcional — si se omite, usa `todosunidos` y lo crea automáticamente al subir la primera foto.

### Desarrollo local (por app)

**`apps/api/.env`**
```env
GEMINI_API_KEY=
SEARXNG_URL=
SEARXNG_USER=
SEARXNG_PASSWORD=
YOUTUBE_API_KEY=
MINIO_ENDPOINT=
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET=          # Opcional
```

**`apps/web/.env.local`**
```env
DATABASE_URL=
ADMIN_PASSWORD=
NEXT_PUBLIC_API_URL=   # En desarrollo: http://localhost:3001/api/v1
```

**`apps/mcp/.env`**
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

# Solo el servidor MCP (puerto 3002)
cd apps/mcp && npm run dev
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

Tres servicios Docker independientes orquestados con Docker Compose:

| Servicio | Puerto | Descripción |
|---------|--------|-------------|
| `web` | 3000 | Frontend público + panel admin |
| `api` | 3001 | API REST + cron jobs de automatización |
| `mcp` | 3002 | Servidor MCP para herramientas de IA |

## Schema de base de datos (11 tablas)

| Tabla | Descripción |
|-------|-------------|
| `platforms` | Organizaciones aliadas autorizadas |
| `unifiedPersons` | Registro maestro unificado por persona |
| `platformReports` | Reportes crudos de cada plataforma (contacto cifrado) |
| `potentialDuplicates` | Cola de duplicados para revisión humana (score 0-100) |
| `newsSummaries` | Resúmenes de noticias generados por IA |
| `collectionCenters` | Centros de acopio y donación |
| `personTips` | Tips ciudadanos sobre personas (con moderación IA) |
| `apiKeys` | Credenciales para partners |
| `webhooks` | Suscripciones a eventos por partner |
| `youtubeChannels` | Canales de YouTube monitoreados (con filtros de palabras clave) |
| `youtubeVideos` | Videos aprobados con título, thumbnail y metadatos |

## Automatizaciones (cron jobs)

| Job | Frecuencia | Descripción |
|-----|-----------|-------------|
| `newsAutomator` | Cada 20 min | Agrega noticias de SearxNG y RSS; Gemini resume y filtra |
| `youtubeAutomator` | Cada 30 min | Descarga videos de canales registrados; Gemini modera contenido irrelevante |
| `deduplicatorAutomator` | Cada 6 horas | Gemini analiza los últimos 200 registros y genera candidatos a duplicados |

## Servidor MCP

Permite a herramientas de IA acceder a la base de datos sin pasar por HTTP. Herramientas expuestas:

| Tool | Descripción |
|------|-------------|
| `buscar_personas` | Busca por nombre, apellido o cédula (hasta 10 resultados) |
| `consultar_acopios` | Lista centros de acopio aprobados, filtrable por estado |
| `obtener_estadisticas` | Totales de desaparecidos, localizados, fallecidos y centros activos |

## API para partners

Autenticación mediante header `x-api-key`.

```
GET  /api/v1/personas        # Listar directorio (paginado, máx. 100)
GET  /api/v1/personas/:id    # Detalle de persona con tips
POST /api/v1/personas        # Reportar persona (dispara webhooks)
POST /api/v1/webhooks        # Registrar webhook para eventos
POST /api/webhooks/ingest    # Ingesta externa con fuzzy matching automático
```

Los webhooks reciben eventos (`person.created`, `person.updated`) en tiempo real con payload completo.

## Licencia

Proyecto de respuesta humanitaria — todos los derechos reservados © Asisteme.
