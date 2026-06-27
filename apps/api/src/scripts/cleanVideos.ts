import { db, youtubeVideos, inArray } from '@todosunidos/db';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  console.log('Iniciando limpieza de videos...');
  
  const allVideos = await db.query.youtubeVideos.findMany();
  console.log(`Se encontraron ${allVideos.length} videos en la base de datos.`);
  
  if (allVideos.length === 0) {
    console.log('No hay videos para limpiar.');
    return;
  }

  const batchSize = 20; // Analizamos de a 20 para no saturar
  const videosToDelete: string[] = [];

  for (let i = 0; i < allVideos.length; i += batchSize) {
    const batch = allVideos.slice(i, i + batchSize);
    
    const prompt = `
      Eres un moderador de una plataforma de emergencias para una catástrofe sismológica en Venezuela.
      A continuación, te doy una lista de videos de YouTube con su ID, Título y Descripción.
      Debes identificar cuáles de estos videos NO tienen nada que ver con la catástrofe, terremotos, rescates, donaciones, emergencias, noticias de crisis o víctimas.
      Si un video es sobre política general, farándula, deportes o temas irrelevantes a la emergencia, márcalo para eliminar.
      
      Devuelve un JSON estrictamente con esta estructura:
      {
        "videosToDeleteIds": ["video_id_1", "video_id_2"]
      }
      
      Lista de videos:
      ${batch.map(v => `ID: ${v.id} | Título: ${v.title} | Desc: ${v.description?.substring(0, 100)}`).join('\n')}
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
        if (result.videosToDeleteIds && result.videosToDeleteIds.length > 0) {
          videosToDelete.push(...result.videosToDeleteIds);
          console.log(`Lote ${i/batchSize + 1}: Marcados ${result.videosToDeleteIds.length} videos para borrar.`);
        }
      }
    } catch (err) {
      console.error(`Error analizando lote ${i/batchSize + 1}:`, err);
    }
  }

  if (videosToDelete.length > 0) {
    console.log(`Eliminando ${videosToDelete.length} videos de la base de datos...`);
    await db.delete(youtubeVideos).where(inArray(youtubeVideos.id, videosToDelete));
    console.log('¡Limpieza completada con éxito!');
  } else {
    console.log('Todos los videos son relevantes. No se eliminó ninguno.');
  }
}

main().catch(console.error);
