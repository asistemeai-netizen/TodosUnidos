import { db } from './src/index';
import { newsSummaries } from './src/schema';
import { eq } from 'drizzle-orm';

async function deleteMock() {
  await db.delete(newsSummaries).where(eq(newsSummaries.sourceName, 'Consolidado IA (Simulación)'));
  console.log('Noticia simulada eliminada de la base de datos.');
}
deleteMock().catch(console.error);
