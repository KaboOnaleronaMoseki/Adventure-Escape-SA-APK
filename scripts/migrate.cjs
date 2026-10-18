const fs = require('node:fs');
const path = require('node:path');
const { Pool } = require('pg');

async function migrate() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL must be configured before applying migrations.');
  }

  const migrationDirectory = path.join(process.cwd(), 'database/migrations');
  const migrations = fs
    .readdirSync(migrationDirectory)
    .filter((file) => /^\d+_[\w-]+\.sql$/.test(file))
    .sort();
  const pool = new Pool({ connectionString });
  let client;

  try {
    client = await pool.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    for (const name of migrations) {
      const alreadyApplied = await client.query(
        'SELECT 1 FROM schema_migrations WHERE name = $1',
        [name],
      );
      if (alreadyApplied.rowCount) {
        console.info(`Skipping already-applied migration ${name}.`);
        continue;
      }

      const sql = fs.readFileSync(path.join(migrationDirectory, name), 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [name]);
        await client.query('COMMIT');
        console.info(`Applied migration ${name}.`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }
  } finally {
    client?.release();
    await pool.end();
  }
}

migrate().catch((error) => {
  console.error('Database migration failed.', error);
  process.exitCode = 1;
});
