# APIs — Todos Unidos

Documentación de nuestra propia API, el servidor MCP y las integraciones con fuentes externas.

---

## Nuestra API (Hono.js)

**Base URL (dev):** `http://localhost:3001`  
**Base URL (prod):** `https://api.todosunidos.com` _(configurar según despliegue)_  
**Autenticación:** Header `x-api-key: <key>`  
Las API keys se generan desde el panel de administración en `/admin/api`.

---

### `GET /api/v1/personas`
Lista paginada del directorio de personas.

**Parámetros:**
| Nombre | Tipo | Descripción |
|--------|------|-------------|
| `limit` | integer | Máximo de registros (1–100). Por defecto 50. |

**Respuesta 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "firstName": "José",
      "lastName": "Bastidas",
      "documentId": "V-12345678",
      "age": 34,
      "gender": "masculino",
      "status": "desaparecido",
      "lastSeenLocation": "La Guaira",
      "lastSeenDate": null,
      "additionalDetails": "Visto por última vez cerca del edificio...",
      "photoUrl": "https://s3.asisteme.ai/todosunidos/...",
      "createdAt": "2026-06-24T00:00:00.000Z",
      "updatedAt": "2026-06-24T00:00:00.000Z",
      "tips": []
    }
  ],
  "meta": { "limit": 50, "count": 50 }
}
```

---

### `GET /api/v1/personas/:id`
Detalle de una persona incluyendo sus tips.

**Respuesta 200:**
```json
{
  "data": { "id": "uuid", "firstName": "...", "tips": [ ... ] }
}
```

---

### `POST /api/v1/personas`
Ingesta un nuevo reporte de persona. Dispara webhooks `person.created` automáticamente.

**Cuerpo:**
```json
{
  "firstName": "José",
  "lastName": "Bastidas",
  "status": "desaparecido",
  "documentId": "V-12345678",
  "age": 34,
  "gender": "masculino",
  "lastSeenLocation": "La Guaira",
  "lastSeenDate": "2026-06-24T00:00:00.000Z",
  "photoUrl": "https://...",
  "additionalDetails": "..."
}
```

> Campos requeridos: `firstName`, `lastName`, `status`.

**Valores válidos de `status`:** `desaparecido` · `localizado_sano` · `fallecido` · `verificando`

**Respuesta 201:**
```json
{
  "message": "Reporte ingresado correctamente",
  "data": { "id": "uuid", ... }
}
```

---

### `POST /api/v1/webhooks`
Registra un webhook para recibir eventos en tiempo real.

**Cuerpo:**
```json
{
  "url": "https://tu-servidor.com/webhook",
  "events": "all"
}
```

> `events` acepta `"all"` o eventos específicos como `"person.created"`, `"person.updated"`.

**Respuesta 201:**
```json
{
  "message": "Webhook registrado correctamente",
  "data": { "id": "uuid", "url": "...", "events": "all" }
}
```

---

### `POST /api/webhooks/ingest`
Endpoint para plataformas aliadas que quieren empujar datos directamente. Incluye detección automática de duplicados con fuzzy matching (`pg_trgm`, umbral 0.4).

**Autenticación:** Header `x-api-key` con el hash de la plataforma aliada.

**Cuerpo:**
```json
{
  "externalId": "ID-EN-TU-SISTEMA",
  "firstName": "José",
  "lastName": "Bastidas",
  "documentId": "V-12345678",
  "status": "desaparecido",
  "age": 34,
  "gender": "masculino",
  "lastSeenLocation": "La Guaira",
  "contactInfo": "..."
}
```

> Campos requeridos: `firstName`, `lastName`, `externalId`.

**Respuesta — nuevo registro:**
```json
{
  "status": "success",
  "message": "Reporte recibido y nueva Persona Unificada creada.",
  "data": { "unifiedId": "uuid" }
}
```

**Respuesta — duplicado detectado:**
```json
{
  "status": "success",
  "message": "Reporte recibido. Posible duplicado detectado, enviado a moderación.",
  "data": { "reportId": "uuid", "matchScore": 87 }
}
```

---

### Eventos de Webhook

Cuando ocurre un evento, tu URL recibe un `POST` con este payload:

```json
{
  "event": "person.created",
  "timestamp": "2026-06-24T12:00:00.000Z",
  "data": { "id": "uuid", "firstName": "José", ... }
}
```

| Evento | Descripción |
|--------|-------------|
| `person.created` | Nueva persona ingresada vía API |
| `person.updated` | Estado de persona actualizado |

---

## Servidor MCP (Model Context Protocol)

Permite que herramientas de IA como **Claude**, **Cursor** o **Windsurf** consulten la base de datos directamente en tiempo real, sin pasar por la API REST.

**Puerto (dev):** `3002`  
**Protocolo:** SSE (Server-Sent Events)

### Configuración en Claude Desktop

Agregar en `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "todos-unidos": {
      "url": "http://localhost:3002/sse"
    }
  }
}
```

### Endpoints SSE

| Método | Path | Descripción |
|--------|------|-------------|
| `GET` | `/sse` | Abre la conexión SSE con el servidor MCP |
| `POST` | `/messages` | Envía mensajes al servidor (manejado automáticamente por el cliente MCP) |

### Herramientas disponibles

#### `buscar_personas`
Busca personas por nombre, apellido o cédula (hasta 10 resultados).

**Input:**
```json
{ "termino": "José Bastidas" }
```

**Output:** Lista formateada con nombre, estado, última ubicación e ID.

---

#### `consultar_acopios`
Lista centros de acopio aprobados y activos.

**Input:**
```json
{ "estado": "Miranda" }
```

> `estado` es opcional. Si se omite, devuelve todos los centros activos.

**Output:** Lista con nombre, dirección, items necesarios y teléfono de contacto.

---

#### `obtener_estadisticas`
Totales agregados del sistema.

**Output:**
```
Estadísticas Actuales de Todos Unidos:
- Personas Desaparecidas: 71432
- Personas Localizadas: 1823
- Fallecidos Confirmados: 312
- Centros de Acopio Activos: 47
```

---

## Integraciones Externas

---

## 1. Desaparecidos Terremoto Venezuela (theempire.tech)

**Base URL:** `https://desaparecidos-terremoto-api.theempire.tech/api/v1`  
**Autenticación:** Header `X-Api-Key: <key>`  
**API Key:** `rec_live_h84lt2XNM03FhxVXa41nYt8bHcuJJwePdSnxMZLhkXc`  
**Variable de entorno:** `API_DESAPARECIDOS`  
**Panel de administración:** `https://desaparecidosterremotovenezuela.com/admin/`

### Endpoints

#### `GET /personas`
Lista paginada de personas (datos públicos depurados).

**Parámetros:**
| Nombre | Tipo | Req. | Descripción |
|--------|------|------|-------------|
| `cursor` | string | No | Token de paginación devuelto en `pagination.nextCursor`. Omitir en la primera página. |
| `limit` | integer | No | Registros por página (1–200). Por defecto 100. |
| `estado` | string | No | Filtra por estado de la persona. |

**Respuesta 200:**
```json
{
  "data": [
    {
      "id": "p47af267283f4",
      "nombre": "Liliagnit Borges",
      "cedula": null,
      "edad": 21,
      "fechaNacimiento": null,
      "estado": "sin-contacto",
      "descripcion": "Es morena, pelo ondulado rulo con lentes",
      "foto": "https://cdn-imagenes.theempire.tech/images/p47af267283f4.jpg",
      "fecha": "2026-06-24",
      "ubicacion": {
        "estado": "La Guaira",
        "municipio": "Vargas",
        "parroquia": "Catia La Mar",
        "direccion": "Catia la mar, Av Atlántida al lado del hotel aeropuerto suite",
        "texto": "Catia la mar, Av Atlántida al lado del hotel aeropuerto suite"
      },
      "centro": {
        "id": "cen_4f2a9c",
        "nombre": "Hospital Universitario de Caracas",
        "tipo": "hospital"
      },
      "contacto": {
        "nombre": null,
        "telefono": "04242248852",
        "correo": null
      },
      "createdAt": 1782358934666,
      "updatedAt": 1782358934666
    }
  ],
  "pagination": {
    "nextCursor": "MTc4MjM1OTA2NzU1ODpwZDczOWJjOWI4MjFh",
    "hasMore": true,
    "limit": 100
  }
}
```

---

#### `GET /personas/{id}`
Detalle de una persona por su ID.

**Parámetros:**
| Nombre | En | Req. | Descripción |
|--------|-----|------|-------------|
| `id` | path | Sí | Identificador de la persona (ej. `p47af267283f4`). |

---

#### `GET /centros`
Lista paginada de centros de acopio y hospitales.

**Parámetros:**
| Nombre | Tipo | Req. | Descripción |
|--------|------|------|-------------|
| `cursor` | string | No | Token de paginación. |
| `limit` | integer | No | Registros por página (1–200). Por defecto 100. |
| `tipo` | string | No | Filtra por tipo de centro (ej. `hospital`, `acopio`). |

**Respuesta 200:**
```json
{
  "data": [
    {
      "id": "cen_4f2a9c",
      "nombre": "Hospital Universitario de Caracas",
      "tipo": "hospital",
      "ubicacion": "Los Chaguaramos, Caracas",
      "telefono": "+58 212-6051111",
      "createdAt": 1718900000000,
      "updatedAt": 1719490000000
    }
  ],
  "pagination": {
    "nextCursor": "eyJ1cGRhdGVkQXQiOjE3...",
    "hasMore": true,
    "limit": 100
  }
}
```

---

#### `GET /listas`
Listas de personas registradas en centros (ej. "Ingresos 20 de junio").

**Parámetros:**
| Nombre | Tipo | Req. | Descripción |
|--------|------|------|-------------|
| `cursor` | string | No | Token de paginación. |
| `limit` | integer | No | Registros por página (1–200). Por defecto 100. |

---

#### `GET /listas/{id}`
Detalle de una lista con su centro y todas las entradas (nombres registrados).

**Respuesta 200:**
```json
{
  "lista": { "id": "lst_7b1e3d", "titulo": "Ingresos 20 de junio", ... },
  "centro": { "id": "cen_4f2a9c", "nombre": "Hospital Universitario de Caracas", ... },
  "entradas": [
    { "id": "ent_3c9d12", "nombre": "Carlos Gómez", "edad": 28, "estado": "pendiente" }
  ]
}
```

---

#### `POST /identificar` ⭐
**Reconocimiento facial** — coteja una foto contra todos los registros y devuelve coincidencias rankeadas por similitud.

> Requiere permiso `people:identify` en la API key.  
> Si la persona es menor (`esMenor: true`), devuelve `needsReview: true` sin candidatos (ruteo a operador).

**Cuerpo:**
```json
{
  "foto": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "esMenor": false
}
```

**Respuesta 200:**
```json
{
  "results": [
    {
      "faceId": "face_2b9a1c",
      "score": 0.91,
      "strongMatch": true,
      "persona": {
        "id": "per_9f3a2b",
        "nombre": "José Bastidas",
        "estado": "sin-contacto"
      }
    }
  ],
  "queryFaces": 1,
  "isMinorQuery": false,
  "needsReview": false,
  "strongThreshold": 0.72,
  "tookMs": 312
}
```

### Códigos de error comunes
| Código | Descripción |
|--------|-------------|
| `401` | API key ausente, inválida, revocada o expirada. |
| `422` | Imagen inválida o sin rostro detectado. |
| `429` | Límite de peticiones por minuto excedido. |

---

## 2. sismo911.com

**Base URL:** `https://sismo911.com`  
**Autenticación:** Ninguna (API pública)  
**API Key:** No requerida

### Endpoints

#### `GET /api/persons/cases`
Lista paginada de casos por número de página.

**Parámetros:**
| Nombre | Tipo | Descripción |
|--------|------|-------------|
| `page` | integer | Número de página (desde 1). |
| `limit` | integer | Registros por página (máx. 500). |

**Notas:**
- Total de registros: ~81,000+
- El campo `photo_url` puede ser ruta relativa (`/api/familia/photo/...`) o URL absoluta de terceros.
- Respuesta incluye `total`, `pages`, `pageSize`.

**Respuesta 200 (muestra):**
```json
{
  "cases": [
    {
      "id": "fam-rav_e41be595-...",
      "case_number": "FAM-F1651369",
      "full_name": "Wilkelys Coronel González",
      "age": 18,
      "sex": null,
      "last_seen": "La guaira",
      "status": "missing",
      "review": "approved",
      "photo_url": "/api/familia/photo/rav_...",
      "notes": "descripción física",
      "priority": "alta",
      "triage": "immediate",
      "score": 72
    }
  ],
  "total": 81673,
  "pages": 164,
  "pageSize": 500
}
```

#### `GET /api/familia/photo/{id}`
Foto de una persona (devuelve imagen directamente).

---

## Notas de implementación

- Los scripts de importación están en `apps/api/src/scripts/`
- `importSismo911.ts` — importa personas de sismo911.com
- `repairPhotos.ts` — repara fotos nulas por bug de URL doble
- `migratePhotos.ts` — migra fotos entre instancias de MinIO
- `deduplicatePersons.ts` — elimina duplicados por nombre+apellido+edad
- Las fotos se almacenan en MinIO bajo `personas/sismo911/<id>.jpg`
- La variable `API_DESAPARECIDOS` en `.env` contiene el key de theempire.tech
