const { Client } = require('pg');

async function setup() {
  const rootUrl = process.env.DATABASE_URL.replace('/todosunidos', '/postgres');
  const rootClient = new Client({ connectionString: rootUrl });
  await rootClient.connect();
  console.log('Connected to root DB');
  try {
    await rootClient.query('CREATE DATABASE todosunidos;');
    console.log('Database created');
  } catch(e) {
    console.log(e.message);
  }
  await rootClient.end();

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('Connected to target DB');
  await client.query('CREATE EXTENSION IF NOT EXISTS pg_trgm;');
  await client.query('CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;');
  console.log('Extensions created successfully.');
  await client.end();
}

setup().catch(console.error);
