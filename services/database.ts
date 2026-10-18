import { Pool } from 'pg';

let pool: Pool | undefined;

export function getDatabasePool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required to use persistent application storage.');
  }

  pool ??= new Pool({ connectionString });
  return pool;
}
