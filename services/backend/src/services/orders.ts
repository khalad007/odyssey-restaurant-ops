import { and, asc, desc, eq, getTableColumns, gte, inArray, lt, lte, sql } from 'drizzle-orm';
import type { z } from 'zod';
import { customers, menuItems, orderItems, orders, settings } from '../db/schema';
import { createOrderSchema, type orderFiltersSchema, type transitionOrderSchema } from '../db/zod';
import { ServiceError } from './errors';
import { nextStatus } from './orderStateMachine';
import { calculateOrderTotals } from './orderTotals';
import { type Database, requireRow, serializeOrder, serializeTimestamps } from './shared';

export async function getOrder(db: Database, id: string) {
  const [row] = await db.select().from(orders).where(eq(orders.id, id));
  const order = requireRow(row, 'Order');
  const [customer] = await db.select().from(customers).where(eq(customers.id, order.customerId));
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id)).orderBy(asc(orderItems.id));
  return { ...serializeOrder(order), items, customer: serializeTimestamps(requireRow(customer, 'Customer')) };
}

export async function createOrder(db: Database, input: z.infer<typeof createOrderSchema>) {
  return db.transaction(async (tx) => {
    const parsed = createOrderSchema.safeParse(input);
    if (!parsed.success) throw new ServiceError(400, parsed.error.issues.map((issue) => issue.message).join('; '));
    const data = parsed.data;
    const [config] = await tx.select().from(settings).where(eq(settings.id, 1)).for('share');
    if (!config) throw new ServiceError(400, 'Restaurant settings are not configured.');
    if (!config.acceptingOrders) throw new ServiceError(400, 'The restaurant is not accepting orders.');
    const [customer] = await tx.select().from(customers).where(eq(customers.id, data.customerId)).for('key share');
    requireRow(customer, 'Customer');

    // Combine duplicate item IDs and lock in a stable order for consistent prices.
    const quantities = new Map<string, number>();
    for (const line of data.items) {
      const id = line.menuItemId.toLowerCase();
      quantities.set(id, (quantities.get(id) ?? 0) + line.quantity);
    }
    const ids = [...quantities.keys()].sort();
    const catalog = await tx.select().from(menuItems).where(inArray(menuItems.id, ids)).orderBy(asc(menuItems.id)).for('share');
    const found = new Set(catalog.map((item) => item.id));
    const missing = ids.filter((id) => !found.has(id));
    if (missing.length) throw new ServiceError(400, `Unknown menu items: ${missing.join(', ')}.`);
    const unavailable = catalog.filter((item) => !item.isAvailable);
    if (unavailable.length) throw new ServiceError(400,
      `Unavailable menu items: ${unavailable.map((item) => `${item.name} (${item.id})`).join(', ')}.`);

    const lines = catalog.map((item) => ({
      menuItemId: item.id, quantity: quantities.get(item.id)!,
      nameSnapshot: item.name, unitPriceCentsSnapshot: item.priceCents,
    }));
    const totals = calculateOrderTotals(lines);
    const [order] = await tx.insert(orders).values({
      customerId: data.customerId, orderType: data.orderType, notes: data.notes,
      status: config.autoAcceptOrders ? nextStatus('pending', 'confirm') : 'pending',
      ...totals,
    }).returning();
    await tx.insert(orderItems).values(lines.map((line) => ({ ...line, orderId: order.id })));
    return getOrder(tx, order.id);
  });
}

export async function transitionOrder(db: Database, id: string, input: z.infer<typeof transitionOrderSchema>) {
  return db.transaction(async (tx) => {
    const [row] = await tx.select().from(orders).where(eq(orders.id, id)).for('update');
    const order = requireRow(row, 'Order');
    const status = nextStatus(order.status, input.action);
    await tx.update(orders).set({ status }).where(eq(orders.id, id));
    return getOrder(tx, id);
  });
}

export async function listOrders(db: Database, filters: z.infer<typeof orderFiltersSchema>) {
  const conditions = [];
  if (filters.status) conditions.push(eq(orders.status, filters.status));
  if (filters.orderType) conditions.push(eq(orders.orderType, filters.orderType));
  if (filters.customerId) conditions.push(eq(orders.customerId, filters.customerId));
  if (filters.dateFrom) conditions.push(gte(orders.createdAt, new Date(filters.dateFrom)));
  if (filters.dateTo) {
    const end = new Date(filters.dateTo);
    if (filters.dateTo.length === 10) {
      end.setUTCDate(end.getUTCDate() + 1);
      conditions.push(lt(orders.createdAt, end));
    } else conditions.push(lte(orders.createdAt, end));
  }
  if (filters.search) conditions.push(sql`position(lower(${filters.search}) in lower(concat_ws(' ',
    ${orders.id}::text, ${orders.notes}, ${customers.name}, ${customers.phone}, ${customers.email}))) > 0`);
  const where = and(...conditions);
  return db.transaction(async (tx) => {
    const [count] = await tx.select({ total: sql<number>`count(*)`.mapWith(Number) }).from(orders)
      .innerJoin(customers, eq(customers.id, orders.customerId)).where(where);
    const rows = await tx.select(getTableColumns(orders)).from(orders)
      .innerJoin(customers, eq(customers.id, orders.customerId)).where(where)
      .orderBy(desc(orders.createdAt), desc(orders.id))
      .limit(filters.pageSize).offset((filters.page - 1) * filters.pageSize);
    return {
      data: rows.map(serializeOrder), page: filters.page, pageSize: filters.pageSize,
      total: count.total, totalPages: Math.ceil(count.total / filters.pageSize),
    };
  }, { isolationLevel: 'repeatable read', accessMode: 'read only' });
}
