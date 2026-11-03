import { and, asc, eq } from 'drizzle-orm';
import type { z } from 'zod';
import type { Database } from './shared';
import { menuCategories, menuItems } from '../db/schema';
import type {
  createMenuCategorySchema, createMenuItemSchema, menuItemFiltersSchema,
  updateMenuCategorySchema, updateMenuItemSchema,
} from '../db/zod';
import { postgresErrorCode, ServiceError } from './errors';

function serialize<T extends { createdAt: Date; updatedAt: Date }>(row: T) {
  const { createdAt, updatedAt, ...data } = row;
  return { ...data, createdAt: createdAt.toISOString(), updatedAt: updatedAt.toISOString() };
}
function requireRow<T>(row: T | undefined, label: string): T {
  if (!row) throw new ServiceError(404, `${label} not found.`);
  return row;
}

export async function listCategories(db: Database) {
  return (await db.select().from(menuCategories).orderBy(asc(menuCategories.sortOrder), asc(menuCategories.name), asc(menuCategories.id))).map(serialize);
}
export async function createCategory(db: Database, input: z.infer<typeof createMenuCategorySchema>) {
  const [row] = await db.insert(menuCategories).values(input).returning();
  return serialize(row);
}
export async function updateCategory(db: Database, id: string, input: z.infer<typeof updateMenuCategorySchema>) {
  const [row] = await db.update(menuCategories).set(input).where(eq(menuCategories.id, id)).returning();
  return serialize(requireRow(row, 'Menu category'));
}
export async function deleteCategory(db: Database, id: string) {
  try {
    // The FK rejects deletion atomically, including concurrent item inserts.
    const [row] = await db.delete(menuCategories).where(eq(menuCategories.id, id)).returning();
    return serialize(requireRow(row, 'Menu category'));
  } catch (error) {
    if (postgresErrorCode(error) === '23503') throw new ServiceError(400, 'Cannot delete a category that still has menu items. Move or delete its items first.');
    throw error;
  }
}
export async function listItems(db: Database, filters: z.infer<typeof menuItemFiltersSchema>) {
  const conditions = [];
  if (filters.categoryId !== undefined) conditions.push(eq(menuItems.categoryId, filters.categoryId));
  if (filters.isAvailable !== undefined) conditions.push(eq(menuItems.isAvailable, filters.isAvailable));
  return (await db.select().from(menuItems).where(and(...conditions)).orderBy(asc(menuItems.name), asc(menuItems.id))).map(serialize);
}
export async function createItem(db: Database, input: z.infer<typeof createMenuItemSchema>) {
  const [row] = await db.insert(menuItems).values(input).returning();
  return serialize(row);
}
export async function updateItem(db: Database, id: string, input: z.infer<typeof updateMenuItemSchema>) {
  const [row] = await db.update(menuItems).set(input).where(eq(menuItems.id, id)).returning();
  return serialize(requireRow(row, 'Menu item'));
}
export async function deleteItem(db: Database, id: string) {
  try {
    const [row] = await db.delete(menuItems).where(eq(menuItems.id, id)).returning();
    return serialize(requireRow(row, 'Menu item'));
  } catch (error) {
    if (postgresErrorCode(error) === '23503') throw new ServiceError(400, 'Cannot delete a menu item used in orders. Mark it unavailable instead.');
    throw error;
  }
}
