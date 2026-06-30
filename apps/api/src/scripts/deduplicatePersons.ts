import dotenv from 'dotenv';
import pg from 'pg';
dotenv.config();

const { Pool } = pg;

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  console.log('=== Deduplicación de personas ===');
  console.log(`DB: ${process.env.DATABASE_URL?.split('@')[1]}\n`);

  // 1. Cuántos duplicados hay
  const { rows: countRows } = await pool.query(`
    SELECT COUNT(*) AS total_duplicados
    FROM (
      SELECT LOWER(TRIM(first_name)), LOWER(TRIM(last_name)), age
      FROM unified_persons
      GROUP BY LOWER(TRIM(first_name)), LOWER(TRIM(last_name)), age
      HAVING COUNT(*) > 1
    ) grupos
  `);
  console.log(`Grupos con duplicados: ${countRows[0].total_duplicados}`);

  const { rows: totalRows } = await pool.query(`SELECT COUNT(*) AS total FROM unified_persons`);
  console.log(`Total de personas en DB: ${totalRows[0].total}`);

  // 2. Identificar qué IDs eliminar:
  //    Por cada grupo (nombre + apellido + edad), puntuar cada registro:
  //      +2 si tiene foto
  //      +1 si tiene last_seen_location
  //      +1 si tiene additional_details
  //    Quedarse con el de mayor puntaje (en caso de empate, el más antiguo = MIN createdAt)
  //    Eliminar el resto junto con sus platform_reports
  const { rows: toDelete } = await pool.query(`
    WITH scored AS (
      SELECT
        id,
        LOWER(TRIM(first_name)) AS fn,
        LOWER(TRIM(last_name))  AS ln,
        age,
        (CASE WHEN photo_url IS NOT NULL THEN 2 ELSE 0 END +
         CASE WHEN last_seen_location IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN additional_details IS NOT NULL THEN 1 ELSE 0 END) AS score,
        created_at
      FROM unified_persons
    ),
    ranked AS (
      SELECT
        id,
        ROW_NUMBER() OVER (
          PARTITION BY fn, ln, age
          ORDER BY score DESC, created_at ASC
        ) AS rn
      FROM scored
    )
    SELECT id FROM ranked WHERE rn > 1
  `);

  console.log(`Registros a eliminar: ${toDelete.length}\n`);

  if (toDelete.length === 0) {
    console.log('No hay duplicados. Nada que hacer.');
    await pool.end();
    return;
  }

  const ids = toDelete.map(r => r.id);

  // 3. Eliminar platform_reports huérfanos primero (FK)
  const { rowCount: prDeleted } = await pool.query(
    `DELETE FROM platform_reports WHERE unified_person_id = ANY($1::uuid[])`,
    [ids]
  );
  console.log(`platform_reports eliminados: ${prDeleted}`);

  // 4. Eliminar potential_duplicates que referencien estos IDs
  await pool.query(
    `DELETE FROM potential_duplicates WHERE unified_person_id = ANY($1::uuid[]) OR duplicate_person_id = ANY($1::uuid[])`,
    [ids]
  );

  // 5. Eliminar person_tips que referencien estos IDs
  await pool.query(
    `DELETE FROM person_tips WHERE unified_person_id = ANY($1::uuid[])`,
    [ids]
  );

  // 6. Eliminar las personas duplicadas
  const { rowCount: personsDeleted } = await pool.query(
    `DELETE FROM unified_persons WHERE id = ANY($1::uuid[])`,
    [ids]
  );
  console.log(`unified_persons eliminados: ${personsDeleted}`);

  const { rows: finalCount } = await pool.query(`SELECT COUNT(*) AS total FROM unified_persons`);
  console.log(`\nTotal final en DB: ${finalCount[0].total}`);
  console.log('=== Deduplicación completa ===');

  await pool.end();
}

main().catch(err => { console.error('Error fatal:', err); process.exit(1); });
