import cron from 'node-cron';
import { GoogleGenAI } from '@google/genai';
import { db, newsSummaries } from '@todosunidos/db';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Función para extraer titulares básicos de un XML/RSS sin dependencias extra
async function fetchNewsFeed(url: string): Promise<string[]> {
  try {
    const res = await fetch(url);
    const text = await res.text();
    // Regex ultra simple para extraer títulos dentro de etiquetas <title>
    const titleMatches = text.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/g);
    
    if (!titleMatches) return [];
    
    return titleMatches
      .map(t => t.replace(/<\/?title>/g, '').replace(/<!\[CDATA\[|\]\]>/g, '').trim())
      .slice(1, 6); // Omitimos el título del canal (índice 0) y agarramos 5 noticias
  } catch (error) {
    console.error(`Error fetching RSS from ${url}:`, error);
    return [];
  }
}

export async function runNewsAutomator() {
  console.log('[CRON] Iniciando motor de noticias automatizado con Gemini...');
  
  try {
    let allTitles: string[] = [];
    const searxngUrl = process.env.SEARXNG_URL;
    const searxngUser = process.env.SEARXNG_USER;
    const searxngPass = process.env.SEARXNG_PASSWORD;

    if (searxngUrl) {
      console.log('[CRON] Utilizando SearxNG para buscar noticias en tiempo real...');
      const searchParams = new URLSearchParams({
        q: 'noticias venezuela emergencia desastre',
        format: 'json',
        language: 'es',
        time_range: 'day'
      });
      
      try {
        const headers: Record<string, string> = {};
        if (searxngUser && searxngPass) {
          headers['Authorization'] = `Basic ${Buffer.from(`${searxngUser}:${searxngPass}`).toString('base64')}`;
        }
        
        const res = await fetch(`${searxngUrl}/search?${searchParams.toString()}`, { headers });
        const data = await res.json();
        // Extraemos los primeros 10 resultados del metabuscador
        allTitles = data.results.slice(0, 10).map((r: any) => `${r.title}: ${r.content || ''}`);
      } catch (err) {
        console.error('[CRON] Error conectando a SearxNG, cayendo a RSS:', err);
      }
    }

    // Fallback a RSS si no hay SearxNG o si falló
    if (allTitles.length === 0) {
      console.log('[CRON] Utilizando feeds RSS como fuente...');
      const feeds = [
        'https://elpitazo.net/feed/',
        'https://efectococuyo.com/feed/'
      ];
      for (const feed of feeds) {
        const titles = await fetchNewsFeed(feed);
        allTitles = [...allTitles, ...titles];
      }
    }

    if (allTitles.length === 0) {
      console.log('[CRON] No se encontraron noticias recientes.');
      return;
    }

    const prompt = `
      Eres un asistente experto en emergencias y crisis en Venezuela.
      A continuación, te doy los titulares de noticias de las últimas horas.
      Tu tarea es filtrar la información y extraer únicamente las noticias relevantes para la contingencia sismológica actual o emergencias de salud/rescate.
      
      Resume la situación actual en formato JSON ESTRICTO con esta estructura:
      {
        "title": "Un título general para el boletín (ej. Boletín de Emergencia - 26 Jun)",
        "content": "Un resumen de 2 a 3 oraciones con lo más importante para la ciudadanía. Sin alarmismos, 100% informativo."
      }
      
      Titulares:
      ${allTitles.join('\n')}
    `;

    console.log('[CRON] Consultando a Gemini 3.1 Flash Lite...');
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text;
    if (responseText) {
      const result = JSON.parse(responseText);
      
      // Guardar en la base de datos
      await db.insert(newsSummaries).values({
        title: result.title,
        content: result.content,
        sourceName: 'Consolidado IA (Varias Fuentes)',
      });
      
      console.log('[CRON] Boletín guardado exitosamente en DB.');
    }
  } catch (error) {
    console.error('[CRON] Error en la automatización de noticias:', error);
  }
}

// Ejecutar cada 1 hora ('0 * * * *')
// Para pruebas rápidas podemos usar ('* * * * *') que es cada minuto.
export function startNewsCron() {
  cron.schedule('0 * * * *', () => {
    runNewsAutomator();
  });
  console.log('🕒 Tarea Cron de Noticias programada (Cada hora)');
}
