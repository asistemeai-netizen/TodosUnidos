import { db, unifiedPersons, eq, isNotNull } from '@todosunidos/db';
import * as Minio from 'minio';
import dotenv from 'dotenv';
dotenv.config();

// MinIO origen (viejo - hardcodeado porque el .env ya fue actualizado)
const OLD_ENDPOINT = 'http://109.123.244.219:9000';
const oldClient = new Minio.Client({
  endPoint: '109.123.244.219',
  port: 9000,
  useSSL: false,
  accessKey: 'fernandoitur',
  secretKey: 'Fir0108747!',
});

// MinIO destino (producción)
const NEW_ENDPOINT = 'https://s3.asisteme.ai';
const NEW_PORT = 443;
const NEW_ACCESS_KEY = 'AHRMS79KSQUKYQM8LS0J';
const NEW_SECRET_KEY = 'ozUdoTAmKmYYbCeuIwMAMQiRboZhXPqk0RoyeQ+Y';
const BUCKET = process.env.MINIO_BUCKET || 'todosunidos';

const newClient = new Minio.Client({
  endPoint: 's3.asisteme.ai',
  port: NEW_PORT,
  useSSL: true,
  accessKey: NEW_ACCESS_KEY,
  secretKey: NEW_SECRET_KEY,
});

async function ensureNewBucket() {
  const exists = await newClient.bucketExists(BUCKET);
  if (!exists) {
    await newClient.makeBucket(BUCKET, 'us-east-1');
    const policy = {
      Version: '2012-10-17',
      Statement: [{ Effect: 'Allow', Principal: { AWS: ['*'] }, Action: ['s3:GetObject'], Resource: [`arn:aws:s3:::${BUCKET}/*`] }],
    };
    await newClient.setBucketPolicy(BUCKET, JSON.stringify(policy));
    console.log(`✓ Bucket "${BUCKET}" creado en nuevo MinIO.`);
  }
}

async function migrateObject(objectName: string): Promise<string> {
  // Descargar del viejo
  const stream = await oldClient.getObject(BUCKET, objectName);
  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', resolve);
    stream.on('error', reject);
  });
  const buffer = Buffer.concat(chunks);

  // Subir al nuevo
  const ext = objectName.split('.').pop() || 'jpg';
  const contentType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
  await newClient.putObject(BUCKET, objectName, buffer, buffer.length, { 'Content-Type': contentType });

  return `${NEW_ENDPOINT}/${BUCKET}/${objectName}`;
}

async function main() {
  console.log('=== Migración de fotos MinIO ===');
  console.log(`Origen: ${OLD_ENDPOINT}`);
  console.log(`Destino: ${NEW_ENDPOINT}\n`);

  await ensureNewBucket();

  // Traer todas las personas con foto del MinIO viejo
  const persons = await db.select({ id: unifiedPersons.id, photoUrl: unifiedPersons.photoUrl })
    .from(unifiedPersons)
    .where(isNotNull(unifiedPersons.photoUrl));

  const oldPrefix = process.env.MINIO_ENDPOINT;
  const toMigrate = persons.filter(p => p.photoUrl?.startsWith(OLD_ENDPOINT));

  console.log(`Personas con foto: ${persons.length}`);
  console.log(`A migrar (URL vieja): ${toMigrate.length}\n`);

  let migrated = 0;
  let errors = 0;

  for (const person of toMigrate) {
    try {
      // Extraer el objectName de la URL: http://host:port/bucket/objectName
      const url = new URL(person.photoUrl!);
      const objectName = url.pathname.replace(`/${BUCKET}/`, '');

      const newUrl = await migrateObject(objectName);

      await db.update(unifiedPersons)
        .set({ photoUrl: newUrl })
        .where(eq(unifiedPersons.id, person.id));

      migrated++;
      process.stdout.write('.');
    } catch (e: any) {
      errors++;
      console.error(`\n✗ Error migrando ${person.id}: ${e?.message ?? e}`);
    }
  }

  console.log(`\n\n=== Migración completa ===`);
  console.log(`Migradas: ${migrated}`);
  console.log(`Errores: ${errors}`);
  console.log(`\nRecuerda actualizar MINIO_ENDPOINT en apps/api/.env y apps/web/.env.local a: ${NEW_ENDPOINT}`);
}

main().catch(err => { console.error('Error fatal:', err); process.exit(1); });
