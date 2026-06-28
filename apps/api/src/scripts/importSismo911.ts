import { db, platforms, unifiedPersons, platformReports, eq } from '@todosunidos/db';
import * as Minio from 'minio';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const PLATFORM_NAME = 'sismo911.com';
const API_BASE = 'https://sismo911.com';
const PAGE_SIZE = 500;
const DELAY_MS = 3000;         // 3s entre páginas para no saturar
const MAX_RECORDS = Infinity;  // Importar todo
const PROGRESS_FILE = path.join(__dirname, '.sismo911-progress.json');

// MinIO
const endpointUrl = new URL(process.env.MINIO_ENDPOINT || 'http://localhost:9000');
const minioClient = new Minio.Client({
  endPoint: endpointUrl.hostname,
  port: parseInt(endpointUrl.port) || (endpointUrl.protocol === 'https:' ? 443 : 80),
  useSSL: endpointUrl.protocol === 'https:',
  accessKey: process.env.MINIO_ACCESS_KEY || '',
  secretKey: process.env.MINIO_SECRET_KEY || '',
});
const BUCKET = process.env.MINIO_BUCKET || 'todosunidos';

async function ensureBucket() {
  const exists = await minioClient.bucketExists(BUCKET);
  if (!exists) {
    await minioClient.makeBucket(BUCKET, 'us-east-1');
    const policy = {
      Version: '2012-10-17',
      Statement: [{ Effect: 'Allow', Principal: { AWS: ['*'] }, Action: ['s3:GetObject'], Resource: [`arn:aws:s3:::${BUCKET}/*`] }],
    };
    await minioClient.setBucketPolicy(BUCKET, JSON.stringify(policy));
    console.log(`✓ Bucket "${BUCKET}" creado.`);
  }
}

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

function mapStatus(raw: string): string {
  switch (raw) {
    case 'missing':  return 'desaparecido';
    case 'found':    return 'localizado_sano';
    case 'deceased': return 'fallecido';
    default:         return 'verificando';
  }
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  const mid = Math.ceil(parts.length / 2);
  return { firstName: parts.slice(0, mid).join(' '), lastName: parts.slice(mid).join(' ') };
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function saveProgress(page: number, imported: number) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify({ page, imported, savedAt: new Date().toISOString() }));
}

function loadProgress(): { page: number; imported: number } | null {
  if (!fs.existsSync(PROGRESS_FILE)) return null;
  try { return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8')); } catch { return null; }
}

function clearProgress() {
  if (fs.existsSync(PROGRESS_FILE)) fs.unlinkSync(PROGRESS_FILE);
}

async function fetchPage(page: number): Promise<{ cases: any[]; total: number; pages: number }> {
  const url = `${API_BASE}/api/persons/cases?sort=triage&page=${page}&limit=${PAGE_SIZE}`;
  let attempt = 0;
  while (true) {
    attempt++;
    const res = await fetch(url);
    if (res.ok) return res.json();
    if (res.status === 429) {
      const wait = Math.min(5000 * Math.pow(2, attempt - 1), 60000);
      console.log(`  ⚠ Rate limit. Reintento ${attempt} en ${wait / 1000}s...`);
      await sleep(wait);
      continue;
    }
    throw new Error(`HTTP ${res.status} al obtener ${url}`);
  }
}

async function ensurePlatform(): Promise<string> {
  const existing = await db.select().from(platforms).where(eq(platforms.name, PLATFORM_NAME));
  if (existing.length > 0) return existing[0].id;
  const inserted = await db.insert(platforms).values({ name: PLATFORM_NAME, webhookUrl: null, apiKeyHash: 'scraper-import' }).returning();
  console.log(`✓ Plataforma "${PLATFORM_NAME}" creada.`);
  return inserted[0].id;
}

async function main() {
  console.log('=== Importador sismo911.com ===');
  console.log(`DB: ${process.env.DATABASE_URL?.split('@')[1]}\n`);

  await ensureBucket();
  const platformId = await ensurePlatform();

  // Carga IDs ya importados
  const existingReports = await db.select({ externalId: platformReports.externalId })
    .from(platformReports).where(eq(platformReports.platformId, platformId));
  const importedIds = new Set(existingReports.map(r => r.externalId));
  console.log(`IDs ya en DB: ${importedIds.size}\n`);

  // Retoma desde progreso guardado si existe
  const saved = loadProgress();
  let startPage = saved?.page ?? 1;
  let totalImported = saved?.imported ?? 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  if (saved) {
    console.log(`▶ Retomando desde página ${startPage} (${totalImported} ya importados)\n`);
  }

  // Obtener total de páginas
  const first = await fetchPage(startPage);
  console.log(`Total en sismo911.com: ${first.total.toLocaleString()} personas en ${first.pages} páginas\n`);

  // Procesar primera página (ya la tenemos)
  let pages = first.pages;
  let batch = [first];

  for (let page = startPage; page <= pages; page++) {
    const data = page === startPage ? first : await fetchPage(page);

    for (const person of data.cases) {
      if (totalImported >= MAX_RECORDS) break;
      if (importedIds.has(person.id)) { totalSkipped++; continue; }

      try {
        const { firstName, lastName } = splitName(person.full_name ?? 'Desconocido');
        const photoUrl = person.photo_url ? await uploadPhoto(person.id, person.photo_url) : null;

        // Transacción: si falla el segundo insert, se revierte el primero
        await db.transaction(async (tx) => {
          const [unified] = await tx.insert(unifiedPersons).values({
            firstName,
            lastName,
            age: person.age ?? null,
            gender: person.sex ?? null,
            status: mapStatus(person.status),
            lastSeenLocation: person.last_seen ?? null,
            additionalDetails: person.notes ?? null,
            photoUrl,
          }).returning();

          await tx.insert(platformReports).values({
            platformId,
            unifiedPersonId: unified.id,
            externalId: person.id,
            rawFirstName: firstName,
            rawLastName: lastName,
            rawStatus: person.status,
            rawPhotoUrl: person.photo_url ? `${API_BASE}${person.photo_url}` : null,
            rawJson: person,
          });
        });

        importedIds.add(person.id);
        totalImported++;
        process.stdout.write('.');
      } catch (e: any) {
        totalErrors++;
        console.error(`\n✗ ${person.full_name}: ${e?.message ?? e}`);
      }
    }

    const pct = Math.round((page / pages) * 100);
    console.log(`\nPágina ${page}/${pages} (${pct}%) ✓ — importados: ${totalImported}, omitidos: ${totalSkipped}, errores: ${totalErrors}`);
    saveProgress(page + 1, totalImported);

    if (totalImported >= MAX_RECORDS) break;
    if (page < pages) await sleep(DELAY_MS);
  }

  clearProgress();
  console.log(`\n=== Importación completa ===`);
  console.log(`Total importados: ${totalImported}`);
  console.log(`Omitidos (ya existían): ${totalSkipped}`);
  console.log(`Errores: ${totalErrors}`);
}

main().catch(err => { console.error('Error fatal:', err); process.exit(1); });
