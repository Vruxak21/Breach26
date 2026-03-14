import { Pool } from 'pg';

let pool: Pool | null = null;

export const getDbPool = (): Pool => {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      console.warn('DATABASE_URL is not defined in environment variables');
    }

    pool = new Pool({
      connectionString: connectionString,
    });
  }

  return pool;
};
