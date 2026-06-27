import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

async function main() {
  const p = new Pool({ connectionString: process.env.DATABASE_URL });
  const r1 = await p.query("DELETE FROM platform_reports WHERE platform_id IN (SELECT id FROM platforms WHERE name = 'sismo911.com')");
  const r2 = await p.query("DELETE FROM unified_persons WHERE id NOT IN (SELECT unified_person_id FROM platform_reports WHERE unified_person_id IS NOT NULL)");
  const r3 = await p.query("DELETE FROM platforms WHERE name = 'sismo911.com'");
  console.log('platform_reports eliminados:', r1.rowCount);
  console.log('unified_persons eliminados:', r2.rowCount);
  console.log('platforms eliminados:', r3.rowCount);
  await p.end();
}

main().catch(console.error);
