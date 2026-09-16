import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './pool.js';

const here = dirname(fileURLToPath(import.meta.url));

async function migrate() {
  const sql = await readFile(join(here, 'schema.sql'), 'utf8');
  await pool.query(sql);
  console.log('✓ Migratsiya bajarildi: subjects, topics, shares');
  await pool.end();
}

migrate().catch((err) => {
  console.error('✗ Migratsiya xatosi:', err.message);
  process.exit(1);
});
