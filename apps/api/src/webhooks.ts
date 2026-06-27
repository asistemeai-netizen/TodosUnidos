import { Hono } from 'hono';
import { db, platforms, platformReports, unifiedPersons, potentialDuplicates } from '@todosunidos/db';
import { eq, sql } from 'drizzle-orm';

const webhooks = new Hono();

// El endpoint recibe el reporte de una plataforma aliada
webhooks.post('/ingest', async (c) => {
  const apiKey = c.req.header('x-api-key');
  
  if (!apiKey) {
    return c.json({ error: 'Missing x-api-key header' }, 401);
  }

  // 1. Validar la plataforma (En la vida real usaríamos crypto para validar el hash)
  const platform = await db.query.platforms.findFirst({
    where: eq(platforms.apiKeyHash, apiKey)
  });

  if (!platform) {
    return c.json({ error: 'Unauthorized platform' }, 401);
  }

  const body = await c.req.json();
  const { 
    externalId, 
    firstName, 
    lastName, 
    documentId, 
    status, 
    age, 
    gender, 
    lastSeenLocation, 
    contactInfo 
  } = body;

  if (!firstName || !lastName || !externalId) {
    return c.json({ error: 'Missing required fields' }, 400);
  }

  // 2. Insertar el reporte crudo (Raw Report)
  const [report] = await db.insert(platformReports).values({
    platformId: platform.id,
    externalId,
    rawFirstName: firstName,
    rawLastName: lastName,
    rawDocumentId: documentId,
    rawStatus: status,
    contactInfoEncrypted: contactInfo,
    rawJson: body
  }).returning();

  // 3. Buscar posibles duplicados con Fuzzy Matching y Trigrams (Similitud > 0.4)
  // Utilizamos similarity() de pg_trgm para buscar nombres parecidos
  const fullName = `${firstName} ${lastName}`;
  const duplicateSearch = await db.execute(sql`
    SELECT id, 
           similarity(first_name || ' ' || last_name, ${fullName}) as score
    FROM unified_persons
    WHERE similarity(first_name || ' ' || last_name, ${fullName}) > 0.4
    ORDER BY score DESC
    LIMIT 1;
  `);

  const bestMatch = duplicateSearch.rows[0];

  if (bestMatch && bestMatch.score && Number(bestMatch.score) > 0.4) {
    // Si la similitud es alta (pero no perfecta), lo mandamos a moderación
    const scorePct = Math.round(Number(bestMatch.score) * 100);
    
    await db.insert(potentialDuplicates).values({
      unifiedPersonId: String(bestMatch.id),
      platformReportId: report.id,
      confidenceScore: scorePct,
      status: 'pendiente'
    });

    return c.json({
      status: 'success',
      message: 'Reporte recibido. Posible duplicado detectado, enviado a moderación.',
      data: { reportId: report.id, matchScore: scorePct }
    });
  }

  // 4. Si no hay match, creamos una nueva Persona Unificada (Registro Maestro)
  const [unified] = await db.insert(unifiedPersons).values({
    firstName,
    lastName,
    documentId,
    age,
    gender,
    status,
    lastSeenLocation
  }).returning();

  // Asociamos el reporte crudo a esta nueva persona unificada
  await db.update(platformReports)
    .set({ unifiedPersonId: unified.id })
    .where(eq(platformReports.id, report.id));

  return c.json({
    status: 'success',
    message: 'Reporte recibido y nueva Persona Unificada creada.',
    data: { unifiedId: unified.id }
  });
});

export default webhooks;
