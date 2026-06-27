import cron from 'node-cron';
import { db, youtubeChannels, youtubeVideos } from '@todosunidos/db';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config();

const YT_BASE = "https://www.googleapis.com/youtube/v3";

async function fetchPlaylistItems(playlistId: string, apiKey: string, maxResults = 5) {
  const url = `${YT_BASE}/playlistItems?part=snippet,contentDetails&maxResults=${maxResults}&playlistId=${playlistId}&key=${apiKey}`;
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`API ${resp.status}: ${await resp.text()}`);
  }
  const data = await resp.json();
  return data.items || [];
}

export async function runYoutubeAutomator() {
  console.log('[CRON] Iniciando recolección de videos de YouTube (Truco UU)...');
  
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.error('[CRON] ERROR: Fata YOUTUBE_API_KEY en .env');
    return;
  }

  try {
    const activeChannels = await db.query.youtubeChannels.findMany({
      where: eq(youtubeChannels.isActive, true)
    });

    if (activeChannels.length === 0) {
      console.log('[CRON] No hay canales activos de YouTube para monitorear.');
      return;
    }

    let insertadosTotal = 0;

    for (const channel of activeChannels) {
      try {
        // Reemplazar UC por UU para acceder a la playlist "Uploads" (1 punto de cuota)
        const uploadsPlaylistId = channel.channelId.replace(/^UC/, "UU");
        const items = await fetchPlaylistItems(uploadsPlaylistId, apiKey, 10);
        
        // Filtro opcional por palabras clave
        const claves = (channel.keywords || "")
          .split(",")
          .map((k) => k.trim().toLowerCase())
          .filter(Boolean);

        for (const it of items) {
          const s = it.snippet;
          const videoId = it.contentDetails?.videoId;
          if (!videoId) continue;

          const title = s.title || "";
          const description = s.description || "";

          // Si el canal tiene keywords, filtramos. Si no, lo pasamos.
          if (claves.length > 0) {
            const text = `${title} ${description}`.toLowerCase();
            const match = claves.some((k) => text.includes(k));
            if (!match) continue;
          }

          const link = `https://www.youtube.com/watch?v=${videoId}`;
          const thumbnailUrl = s.thumbnails?.high?.url || s.thumbnails?.default?.url || null;

          // INSERT ON CONFLICT DO NOTHING (Drizzle Postgresql)
          const result = await db.insert(youtubeVideos).values({
            videoId,
            channelId: channel.id,
            title,
            description: description.slice(0, 1000), // Límite de texto
            url: link,
            thumbnailUrl,
            publishedAt: new Date(s.publishedAt),
            channelName: s.channelTitle || channel.name
          }).onConflictDoNothing({ target: youtubeVideos.videoId });

          if (result.rowCount && result.rowCount > 0) {
            insertadosTotal++;
          }
        }
      } catch (err) {
        console.error(`[CRON] Error procesando canal ${channel.name}:`, err);
      }
    }

    console.log(`[CRON] Recolección de YouTube finalizada. ${insertadosTotal} nuevos videos agregados.`);
  } catch (error) {
    console.error('[CRON] Error crítico en youtubeAutomator:', error);
  }
}

// Ejecutar cada 30 minutos ('*/30 * * * *')
export function startYoutubeCron() {
  cron.schedule('*/30 * * * *', () => {
    runYoutubeAutomator();
  });
  console.log('▶ Tarea Cron de YouTube programada (Cada 30 minutos)');
}
