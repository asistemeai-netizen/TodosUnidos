import { Hono } from 'hono'
import { db } from '@todosunidos/db'
import { apiKeys, unifiedPersons, webhooks } from '@todosunidos/db/src/schema'
import { eq, desc } from 'drizzle-orm'
import { emitWebhook } from '../../utils/webhookEmitter'

// Extendemos el contexto de Hono para el middleware
type Variables = {
  apiKey: typeof apiKeys.$inferSelect
}

const publicApi = new Hono<{ Variables: Variables }>()

// Middleware para verificar API Key
publicApi.use('*', async (c, next) => {
  const key = c.req.header('x-api-key')
  
  if (!key) {
    return c.json({ error: 'API Key requerida en el header x-api-key' }, 401)
  }

  // Buscar llave en BD
  const apiKeyRecord = await db.query.apiKeys.findFirst({
    where: (apiKeys, { eq, and }) => and(eq(apiKeys.key, key), eq(apiKeys.isActive, true))
  })

  if (!apiKeyRecord) {
    return c.json({ error: 'API Key inválida o inactiva' }, 401)
  }

  // Guardar la llave en el contexto para usarla luego
  c.set('apiKey', apiKeyRecord)
  
  await next()
})

// GET /api/v1/personas - Listar directorio
publicApi.get('/personas', async (c) => {
  const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100);
  
  const persons = await db.query.unifiedPersons.findMany({
    orderBy: [desc(unifiedPersons.createdAt)],
    limit,
    with: {
      tips: true
    }
  });

  return c.json({
    data: persons,
    meta: {
      limit,
      count: persons.length
    }
  })
})

// GET /api/v1/personas/:id - Detalle de persona
publicApi.get('/personas/:id', async (c) => {
  const id = c.req.param('id')
  
  const person = await db.query.unifiedPersons.findFirst({
    where: (unifiedPersons, { eq }) => eq(unifiedPersons.id, id),
    with: {
      tips: true
    }
  });

  if (!person) {
    return c.json({ error: 'Persona no encontrada' }, 404)
  }

  return c.json({ data: person })
})

// POST /api/v1/personas - Ingesta externa
publicApi.post('/personas', async (c) => {
  const apiKey = c.get('apiKey')
  const body = await c.req.json()
  
  // Validación básica
  if (!body.firstName || !body.lastName || !body.status) {
    return c.json({ error: 'Faltan campos requeridos: firstName, lastName, status' }, 400)
  }

  // Insertar en BD
  const [newPerson] = await db.insert(unifiedPersons).values({
    status: body.status,
    firstName: body.firstName,
    lastName: body.lastName,
    documentId: body.documentId,
    age: body.age,
    gender: body.gender,
    lastSeenLocation: body.lastSeenLocation,
    lastSeenDate: body.lastSeenDate ? new Date(body.lastSeenDate) : undefined,
    photoUrl: body.photoUrl,
    additionalDetails: body.additionalDetails
  }).returning()

  // Disparar webhooks
  await emitWebhook('person.created', newPerson)

  return c.json({
    message: 'Reporte ingresado correctamente',
    data: newPerson
  }, 201)
})

// POST /api/v1/webhooks - Registro de Webhooks
publicApi.post('/webhooks', async (c) => {
  const apiKey = c.get('apiKey')
  const body = await c.req.json()

  if (!body.url) {
    return c.json({ error: 'El campo url es requerido' }, 400)
  }

  const [newWebhook] = await db.insert(webhooks).values({
    apiKeyId: apiKey.id,
    url: body.url,
    events: body.events || 'all'
  }).returning()

  return c.json({
    message: 'Webhook registrado correctamente',
    data: newWebhook
  }, 201)
})

export default publicApi
