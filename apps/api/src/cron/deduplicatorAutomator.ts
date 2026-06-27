import cron from 'node-cron';
import { db, unifiedPersons, potentialDuplicates } from '@todosunidos/db';
import { eq, desc } from 'drizzle-orm';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function runDeduplicatorAutomator() {
  console.log('[CRON] Iniciando detección de duplicados con IA (Gemini)...');
  
  try {
    // 1. Obtener los últimos 200 desaparecidos recientes
    // Aumentamos el límite de análisis para darle buen contexto a Gemini
    const recentPersons = await db.query.unifiedPersons.findMany({
      where: eq(unifiedPersons.status, 'desaparecido'),
      orderBy: [desc(unifiedPersons.createdAt)],
      limit: 200,
    });

    if (recentPersons.length < 2) {
      console.log('[CRON] No hay suficientes registros para comparar.');
      return;
    }

    // 2. Preparar el JSON simplificado para evitar exceder los tokens y abaratar costos
    const dataToAnalyze = recentPersons.map(p => ({
      id: p.id,
      nombre: `${p.firstName} ${p.lastName}`,
      edad: p.age,
      genero: p.gender,
      detalles: p.additionalDetails,
      lugarVisto: p.lastSeenLocation,
      fechaVisto: p.lastSeenDate
    }));

    // 3. Prompt de sistema riguroso para la deduplicación semántica
    const prompt = `
Eres un analista de datos forense especializado en reunir familias en emergencias sismológicas.
Revisa esta lista de personas reportadas como desaparecidas. Tu única tarea es encontrar posibles duplicados lógicos (reportes que se refieren exactamente a la misma persona pero fueron subidos por familiares distintos, a veces con ligeras variaciones en el nombre o descripción, o sin apellido).
Busca similitudes fuertes cruzando: Nombre, Apellido, Edad, Género, Lugar y Detalles Físicos.

Devuelve ESTRICTAMENTE un JSON con el siguiente formato:
{
  "duplicados": [
    { "person_a_id": "id1", "person_b_id": "id2", "confidence_score": 90 }
  ]
}
Si no hay duplicados, devuelve {"duplicados": []}.

Datos a analizar:
${JSON.stringify(dataToAnalyze, null, 2)}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    if (!response.text) {
      console.log('[CRON] Gemini no devolvió texto.');
      return;
    }

    const result = JSON.parse(response.text);
    const duplicates = result.duplicados || [];

    let count = 0;
    for (const dup of duplicates) {
      // Ignorar matches con baja confianza o falsos positivos (A consigo mismo)
      if (dup.person_a_id && dup.person_b_id && dup.confidence_score > 75 && dup.person_a_id !== dup.person_b_id) {
        
        // Verificar si ya existe este match en potentialDuplicates para no repetirlo infinitamente
        const existing = await db.query.potentialDuplicates.findMany({
          where: (pd, { and, eq, or }) => or(
            and(eq(pd.unifiedPersonId, dup.person_a_id), eq(pd.duplicatePersonId, dup.person_b_id)),
            and(eq(pd.unifiedPersonId, dup.person_b_id), eq(pd.duplicatePersonId, dup.person_a_id))
          )
        });

        if (existing.length === 0) {
          await db.insert(potentialDuplicates).values({
            unifiedPersonId: dup.person_a_id,
            duplicatePersonId: dup.person_b_id,
            confidenceScore: dup.confidence_score,
            status: 'pendiente'
          });
          count++;
        }
      }
    }
    console.log(`[CRON] Análisis de duplicados completado. Se agregaron ${count} posibles duplicados para revisión humana.`);

  } catch (error) {
    console.error('[CRON] Error en deduplicatorAutomator:', error);
  }
}

// Ejecutar cada 6 horas o al gusto
export function startDeduplicatorCron() {
  cron.schedule('0 */6 * * *', () => {
    runDeduplicatorAutomator();
  });
  console.log('▶ Tarea Cron de Deduplicación programada (Cada 6 horas)');
}
