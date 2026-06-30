'use server';

import { db, personTips, newsSummaries, collectionCenters, youtubeVideos, desc, eq, and } from "@todosunidos/db";
import { GoogleGenAI } from '@google/genai';

export async function submitPersonTipAction(formData: FormData) {
  try {
    const unifiedPersonId = formData.get("unifiedPersonId")?.toString();
    const informationText = formData.get("informationText")?.toString();

    if (!unifiedPersonId || !informationText) {
      return { success: false, error: "Faltan datos obligatorios" };
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // AI Moderation Step
    const prompt = `
      Actúa como un moderador de una plataforma de emergencias para personas desaparecidas.
      Analiza el siguiente comentario de un usuario aportando información sobre un desaparecido.
      Debes bloquear el comentario (isSafe: false) si:
      - Contiene insultos, groserías o palabras altisonantes (es un hater).
      - Es spam evidente, publicidad o contenido totalmente ajeno a emergencias.
      - Es una burla u ofensa a la víctima o familiares.
      
      Si el comentario parece un reporte normal, sano (incluso si la información es dudosa pero no malintencionada) o simplemente es inofensivo, apruébalo (isSafe: true).
      
      Devuelve un JSON con:
      {
        "isSafe": boolean,
        "reason": "Explicación breve de por qué fue bloqueado o aprobado (max 1 oración)"
      }
      
      Comentario a evaluar:
      "${informationText}"
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });
      
      if (response.text) {
        const result = JSON.parse(response.text);
        if (result.isSafe === false) {
          // Guardar en BD pero rechazado (para auditoría)
          await db.insert(personTips).values({
            unifiedPersonId,
            informationText,
            status: 'rechazado',
            aiModerationReason: result.reason
          });
          return { success: false, error: "Tu aporte fue bloqueado por nuestro sistema automático de moderación: " + result.reason };
        }
      }
    } catch (aiError) {
      console.error("Error en la moderación de IA (se aprueba por defecto por fallo de API):", aiError);
    }

    await db.insert(personTips).values({
      unifiedPersonId,
      informationText,
      status: 'aprobado'
    });

    return { success: true };
  } catch (error) {
    console.error("Error submitting tip:", error);
    return { success: false, error: "Ocurrió un error al guardar la información" };
  }
}

export async function getPersonTipsAction(unifiedPersonId: string) {
  try {
    const tips = await db.query.personTips.findMany({
      where: (tips, { eq, and }) => and(
        eq(tips.unifiedPersonId, unifiedPersonId),
        eq(tips.status, 'aprobado')
      ),
      orderBy: [desc(personTips.createdAt)],
    });
    return { success: true, tips };
  } catch (error) {
    console.error("Error fetching tips:", error);
    return { success: false, error: "No se pudieron cargar los aportes" };
  }
}

export async function getRejectedTipsAction() {
  try {
    const tips = await db.query.personTips.findMany({
      where: eq(personTips.status, 'rechazado'),
      orderBy: [desc(personTips.createdAt)],
      with: {
        person: true
      }
    });
    return { success: true, tips };
  } catch (error) {
    console.error("Error fetching rejected tips:", error);
    return { success: false, error: "No se pudieron cargar los aportes rechazados" };
  }
}

export async function approveTipAction(tipId: string) {
  try {
    await db.update(personTips)
      .set({ status: 'aprobado' })
      .where(eq(personTips.id, tipId));
    return { success: true };
  } catch (error) {
    console.error("Error approving tip:", error);
    return { success: false, error: "Error al aprobar el aporte" };
  }
}

export async function getCollectionCentersAction() {
  return await db.query.collectionCenters.findMany({
    where: eq(collectionCenters.status, 'aprobado'),
    orderBy: [desc(collectionCenters.createdAt)],
  });
}

export async function getNewsSummariesAction() {
  return await db.query.newsSummaries.findMany({
    orderBy: [desc(newsSummaries.createdAt)],
    limit: 10,
  });
}

export async function getYoutubeVideosAction() {
  return await db.query.youtubeVideos.findMany({
    orderBy: [desc(youtubeVideos.publishedAt)],
    limit: 3,
  });
}

export async function getAllYoutubeVideosAction() {
  return await db.query.youtubeVideos.findMany({
    orderBy: [desc(youtubeVideos.publishedAt)],
    limit: 100,
  });
}
