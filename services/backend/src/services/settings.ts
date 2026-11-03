import { eq } from 'drizzle-orm';
import type { z } from 'zod';
import { settings } from '../db/schema';
import { settingsResponseSchema, type updateSettingsSchema } from '../db/zod';
import { type Database, requireRow } from './shared';

export async function getSettings(db: Database) {
  const [row] = await db.select().from(settings).where(eq(settings.id, 1));
  return settingsResponseSchema.parse(requireRow(row, 'Settings'));
}

export async function updateSettings(db: Database, input: z.infer<typeof updateSettingsSchema>) {
  const [row] = await db.insert(settings).values({ id: 1, ...input })
    .onConflictDoUpdate({ target: settings.id, set: input }).returning();
  return settingsResponseSchema.parse(row);
}
