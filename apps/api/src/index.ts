import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import 'dotenv/config'
import { startNewsCron, runNewsAutomator } from './cron/newsAutomator'
import { startYoutubeCron, runYoutubeAutomator } from './cron/youtubeAutomator'
import { startDeduplicatorCron } from './cron/deduplicatorAutomator'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', cors())

// Rutas básicas
app.get('/', (c) => {
  return c.json({ status: 'ok', message: 'TodosUnidos Hub API funcionando al tiro' })
})

// Iniciar los Cron Jobs
startNewsCron();
startYoutubeCron();
startDeduplicatorCron();

// Ruta de prueba para forzar el motor de noticias manualmente
app.get('/api/test-cron', async (c) => {
  await runNewsAutomator();
  return c.json({ message: 'Motor de noticias ejecutado manualmente.' });
});

// Ruta de prueba para forzar YouTube manualmente
app.get('/api/test-youtube', async (c) => {
  await runYoutubeAutomator();
  return c.json({ message: 'Recolección de YouTube ejecutada manualmente.' });
});

import webhooks from './webhooks'
import publicApi from './routes/v1/public'

// Montar el router de webhooks de Clerk
app.route('/api/webhooks', webhooks)

// Montar el router de la API Pública v1
app.route('/api/v1', publicApi)

const port = process.env.PORT ? parseInt(process.env.PORT) : 3001
console.log(`API Hub arrancando en el puerto ${port}...`)

serve({
  fetch: app.fetch,
  port
})
