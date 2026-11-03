import { asc, desc, eq, getTableColumns, sql } from 'drizzle-orm';
import type { z } from 'zod';
import { customers, orders } from '../db/schema';
import type { createCustomerSchema, updateCustomerSchema } from '../db/zod';
import { type Database, requireRow, serializeOrder, serializeTimestamps } from './shared';

function summaries(db: Database) {
  return db.select({
    ...getTableColumns(customers),
    orderCount: sql<number>`count(${orders.id})`.mapWith(Number),
    totalSpentCents: sql<number>`coalesce(sum(${orders.totalCents}) filter (where ${orders.status} <> 'cancelled'), 0)`.mapWith(Number),
    lastOrderAt: sql<string | null>`max(${orders.createdAt})`
      .mapWith((value): string | null => value == null ? null : new Date(String(value)).toISOString()),
  }).from(customers).leftJoin(orders, eq(orders.customerId, customers.id)).groupBy(customers.id);
}

export async function listCustomers(db: Database) {
  return (await summaries(db).orderBy(asc(customers.name), asc(customers.id))).map(serializeTimestamps);
}

export async function getCustomer(db: Database, id: string) {
  const [row] = await summaries(db).where(eq(customers.id, id));
  const customer = serializeTimestamps(requireRow(row, 'Customer'));
  const recentOrders = await db.select().from(orders).where(eq(orders.customerId, id))
    .orderBy(desc(orders.createdAt), desc(orders.id)).limit(10);
  return { ...customer, recentOrders: recentOrders.map(serializeOrder) };
}

export async function createCustomer(db: Database, input: z.infer<typeof createCustomerSchema>) {
  const [row] = await db.insert(customers).values(input).returning();
  return serializeTimestamps(row);
}

export async function updateCustomer(db: Database, id: string, input: z.infer<typeof updateCustomerSchema>) {
  const [row] = await db.update(customers).set(input).where(eq(customers.id, id)).returning();
  return serializeTimestamps(requireRow(row, 'Customer'));
}
