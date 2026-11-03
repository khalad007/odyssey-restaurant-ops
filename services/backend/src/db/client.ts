import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export function createDatabase(databaseUrl: string) {
  if (!databaseUrl) throw new Error('DATABASE_URL Worker binding is required.');

  // Never share a socket or client across Worker request contexts.
  const client = postgres(databaseUrl, { max: 1, prepare: false });
  return {
    db: drizzle(client, { schema }),
    close: () => client.end({ timeout: 5 }),
  };
}
