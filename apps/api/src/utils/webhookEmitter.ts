import { db } from '@todosunidos/db'
import { webhooks } from '@todosunidos/db/src/schema'

export async function emitWebhook(event: string, payload: any) {
  try {
    // Buscar todos los webhooks activos
    const allWebhooks = await db.query.webhooks.findMany({
      where: (webhooks, { eq }) => eq(webhooks.isActive, true)
    })

    // Filtrar los webhooks que escuchan este evento o 'all'
    const targetWebhooks = allWebhooks.filter(wh => 
      wh.events === 'all' || wh.events.includes(event)
    )

    if (targetWebhooks.length === 0) return

    console.log(`Emitiendo evento ${event} a ${targetWebhooks.length} webhooks...`)

    // Enviar POST requests en paralelo sin bloquear
    targetWebhooks.forEach(async (webhook) => {
      try {
        await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-todosunidos-event': event
          },
          body: JSON.stringify({
            event,
            timestamp: new Date().toISOString(),
            data: payload
          }),
          signal: AbortSignal.timeout(5000) // Timeout de 5s
        })
      } catch (err) {
        console.error(`Error enviando webhook a ${webhook.url}:`, err)
      }
    })
  } catch (error) {
    console.error('Error procesando emisión de webhooks:', error)
  }
}
