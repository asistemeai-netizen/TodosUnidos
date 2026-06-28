import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

async function main() {
  const p = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const res = await p.query(`SELECT id, first_name, last_name, photo_url FROM unified_persons WHERE first_name ILIKE '%Nilda Estrella%' OR first_name ILIKE 'Nilda' AND last_name ILIKE '%Estrella%'`);
    console.log("Unified Persons:");
    console.log(res.rows);

    const res2 = await p.query(`SELECT id, raw_first_name, raw_last_name, raw_photo_url FROM platform_reports WHERE raw_first_name ILIKE '%Nilda Estrella%' OR raw_first_name ILIKE 'Nilda' AND raw_last_name ILIKE '%Estrella%'`);
    console.log("Platform Reports:");
    console.log(res2.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await p.end();
  }
}

main();
