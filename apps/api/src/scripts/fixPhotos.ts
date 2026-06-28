import { db, unifiedPersons, platformReports, eq, and, like, isNull } from '@todosunidos/db';
import * as Minio from 'minio';
import dotenv from 'dotenv';
import pg from 'pg';
const { Pool } = pg;

dotenv.config();

// MinIO Config
const endpointUrl = new URL(process.env.MINIO_ENDPOINT || 'http://localhost:9000');
const minioClient = new Minio.Client({
  endPoint: endpointUrl.hostname,
  port: parseInt(endpointUrl.port) || (endpointUrl.protocol === 'https:' ? 443 : 80),
  useSSL: endpointUrl.protocol === 'https:',
  accessKey: process.env.MINIO_ACCESS_KEY || '',
  secretKey: process.env.MINIO_SECRET_KEY || '',
});
const BUCKET = process.env.MINIO_BUCKET || 'todosunidos';

async function uploadPhoto(externalId: string, url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
    const objectName = `personas/sismo911/fixed_${externalId}.${ext}`;
    
    await minioClient.putObject(BUCKET, objectName, buffer, buffer.length, { 'Content-Type': contentType });
    return `${process.env.MINIO_ENDPOINT}/${BUCKET}/${objectName}`;
  } catch (e) {
    console.error(`Error descargando ${url}:`, e);
    return null;
  }
}

async function main() {
  console.log('=== Iniciando Reparación de Fotos ===');
  
  // Usamos pg crudo para facilitar el select de este caso específico
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // Buscar los reportes con el error de URL doble y que actualmente no tienen foto en unified_persons
    const query = `
      SELECT p.id as report_id, p.external_id, p.raw_photo_url, p.unified_person_id 
      FROM platform_reports p
      JOIN unified_persons u ON p.unified_person_id = u.id
      WHERE p.raw_photo_url LIKE 'https://sismo911.comhttp%'
      AND u.photo_url IS NULL
    `;
    
    const { rows } = await pool.query(query);
    console.log(`Se encontraron ${rows.length} registros con URLs rotas.\n`);

    let fixedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      // Extraer la URL real removiendo "https://sismo911.com" del inicio
      const realUrl = row.raw_photo_url.replace('https://sismo911.com', '');
      
      process.stdout.write(`[${i + 1}/${rows.length}] Reparando ${row.external_id}... `);
      
      const newMinioUrl = await uploadPhoto(row.external_id, realUrl);
      
      if (newMinioUrl) {
        // Actualizar unified_persons con la nueva foto
        await db.update(unifiedPersons)
          .set({ photoUrl: newMinioUrl })
          .where(eq(unifiedPersons.id, row.unified_person_id));
          
        // Corregir también en platform_reports
        await db.update(platformReports)
          .set({ rawPhotoUrl: realUrl })
          .where(eq(platformReports.id, row.report_id));
          
        console.log(`✓ OK`);
        fixedCount++;
      } else {
        console.log(`❌ Falló la descarga de ${realUrl}`);
        errorCount++;
      }
      
      // Pequeña pausa para no saturar al servidor externo
      await new Promise(r => setTimeout(r, 500));
    }

    console.log(`\n=== Proceso completado ===`);
    console.log(`Total reparados: ${fixedCount}`);
    console.log(`Errores de descarga: ${errorCount}`);

  } catch (err) {
    console.error('Error fatal:', err);
  } finally {
    await pool.end();
  }
}

main();
