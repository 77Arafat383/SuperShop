import { Pool, QueryResult, QueryResultRow } from 'pg';

// Support PostgreSQL connection strings from Vercel Postgres, Neon, Supabase, or standard PG
const rawConnectionString = 
  process.env.POSTGRES_URL || 
  process.env.DATABASE_URL || 
  process.env.POSTGRES_PRISMA_URL ||
  '';

function normalizeConnectionString(value: string): string {
  const match = value.match(/^((?:postgres|postgresql):\/\/[^:/?#]+:)([^@]*)(@.+)$/);
  if (!match || !match[2]) {
    return value;
  }

  try {
    return `${match[1]}${encodeURIComponent(decodeURIComponent(match[2]))}${match[3]}`;
  } catch {
    return `${match[1]}${encodeURIComponent(match[2])}${match[3]}`;
  }
}

const connectionString = normalizeConnectionString(rawConnectionString);

let pool: Pool | null = null;

if (connectionString) {
  pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
}

export async function query<T extends QueryResultRow = any>(
  text: string, 
  params?: any[]
): Promise<QueryResult<T> | null> {
  if (!pool) {
    // Graceful check if no direct PG connection string configured
    return null;
  }
  try {
    const start = Date.now();
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { text: text.slice(0, 80), duration, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error('PostgreSQL query error:', error);
    throw error;
  }
}

export function isPostgresConfigured(): boolean {
  return !!pool;
}

export default pool;
