import { db, unifiedPersons, platformReports } from '@todosunidos/db';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const total = await db.select().from(unifiedPersons);
  console.log('Total unified_persons:', total.length);

  const reports = await db.select().from(platformReports);
  console.log('Total platform_reports:', reports.length);

  // Buscar external IDs duplicados
  const ids = reports.map(r => r.externalId);
  const seen = new Set<string>();
  const dupes: string[] = [];
  for (const id of ids) {
    if (seen.has(id)) dupes.push(id);
    else seen.add(id);
  }
  console.log('\nExternal IDs duplicados:', dupes.length);
  if (dupes.length > 0) console.log('Muestra:', dupes.slice(0, 5));

  // Mostrar últimos 5 registros
  console.log('\nÚltimos 5 insertados:');
  total.slice(-5).forEach(p => console.log(` - ${p.firstName} ${p.lastName} | ${p.status} | ${p.createdAt}`));
}

main().catch(console.error);
