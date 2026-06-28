import { db, unifiedPersons, platformReports, eq, isNull, isNotNull } from '@todosunidos/db';
import * as Minio from 'minio';
import dotenv from 'dotenv';
dotenv.config();

const API_BASE = 'https://sismo911.com';
const BUCKET = process.env.MINIO_BUCKET || 'todosunidos';

const endpointUrl = new URL(process.env.MINIO_ENDPOINT || 'http://localhost:9000');
const minioClient = new Minio.Client({
  endPoint: endpointUrl.hostname,
  port: parseInt(endpointUrl.port) || (endpointUrl.protocol === 'https:' ? 443 : 80),
  useSSL: endpointUrl.protocol === 'https:',
  accessKey: process.env.MINIO_ACCESS_KEY || '',
  secretKey: process.env.MINIO_SECRET_KEY || '',
});

async function uploadPhoto(externalId: string, photoPath: string): Promise<string | null> {
  try {
    const fullUrl = photoPath.startsWith('http') ? photoPath : `${API_BASE}${photoPath}`;
    const res = await fetch(fullUrl);
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
    const objectName = `personas/sismo911/${externalId}.${ext}`;
    await minioClient.putObject(BUCKET, objectName, buffer, buffer.length, { 'Content-Type': contentType });
    return `${process.env.MINIO_ENDPOINT}/${BUCKET}/${objectName}`;
  } catch {
    return null;
  }
}

async function main() {
  console.log('=== Reparación de fotos nulas ===');
  console.log(`MinIO: ${process.env.MINIO_ENDPOINT}\n`);

  // Buscar personas sin foto que tengan platform_report con foto en rawJson
  const reports = await db.select({
    unifiedPersonId: platformReports.unifiedPersonId,
    externalId: platformReports.externalId,
    rawJson: platformReports.rawJson,
  })
  .from(platformReports)
  .innerJoin(unifiedPersons, eq(platformReports.unifiedPersonId, unifiedPersons.id))
  .where(isNull(unifiedPersons.photoUrl));

  const withPhoto = reports.filter(r => {
    const raw = r.rawJson as any;
    return raw?.photo_url && raw.photo_url.trim() !== '';
  });

  console.log(`Personas sin foto en DB: ${reports.length}`);
  console.log(`Con foto disponible en rawJson: ${withPhoto.length}\n`);

  let repaired = 0;
  let failed = 0;

  for (const report of withPhoto) {
    const raw = report.rawJson as any;
    const photoUrl = await uploadPhoto(report.externalId, raw.photo_url);

    if (photoUrl) {
      await db.update(unifiedPersons)
        .set({ photoUrl })
        .where(eq(unifiedPersons.id, report.unifiedPersonId!));
      repaired++;
      process.stdout.write('.');
    } else {
      failed++;
    }
  }

  console.log(`\n\n=== Reparación completa ===`);
  console.log(`Reparadas: ${repaired}`);
  console.log(`Sin foto disponible: ${failed}`);
}

main().catch(err => { console.error('Error fatal:', err); process.exit(1); });
