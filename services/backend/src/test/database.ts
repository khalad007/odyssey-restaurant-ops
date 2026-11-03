import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { createDatabase } from '../db/client';

export async function createTestDatabase() {
  // Never use DATABASE_URL: tests create their own database via the admin database.
  const adminUrl = new URL(process.env.TEST_DATABASE_ADMIN_URL
    ?? 'postgres://postgres:postgres@localhost:5432/postgres');
  const name = `odyssey_test_${randomUUID().replaceAll('-', '')}`;
  const testUrl = new URL(adminUrl);
  testUrl.pathname = `/${name}`;
  const admin = postgres(adminUrl.toString(), { max: 1, connect_timeout: 5, onnotice: () => {} });
  let created = false;
  async function dispose() {
    try {
      if (created) {
        await admin`drop database ${admin(name)} with (force)`;
        created = false;
      }
    } finally { await admin.end(); }
  }
  try {
    await admin`create database ${admin(name)}`;
    created = true;
    const database = createDatabase(testUrl.toString());
    try {
      await migrate(database.db, { migrationsFolder: fileURLToPath(new URL('../../drizzle', import.meta.url)) });
    } finally { await database.close(); }
    return { url: testUrl.toString(), dispose };
  } catch (error) {
    await dispose();
    throw new Error('Could not prepare the isolated test database. Run pnpm db:up; TEST_DATABASE_ADMIN_URL can override the local postgres admin connection.', { cause: error });
  }
}
