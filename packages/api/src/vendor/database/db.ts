import 'dotenv/config';
// @ts-ignore - mysql2 types may not be present
import { createPool } from 'mysql2/promise';
// @ts-ignore - drizzle types may not be present
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from './schema';

const url = process.env.MYSQL_URL;

if (!url) {
  throw new Error('MYSQL_URL manquant dans packages/database/.env');
}

export const pool = createPool({
  uri: url,
  connectionLimit: 10,
});

export const db = drizzle(pool, {
  schema,
  mode: 'default',
});

