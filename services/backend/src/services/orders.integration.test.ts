import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createDatabase } from '../db/client';
import { customers, menuCategories, menuItems, orderItems, orders, settings } from '../db/schema';
import { createOrderSchema, orderDetailSchema, orderFiltersSchema } from '../db/zod';
import { getCustomer } from './customers';
import { getDashboardSummary } from './dashboard';
import { createOrder, getOrder, listOrders, transitionOrder } from './orders';
import { createTestDatabase } from '../test/database';

describe('Orders with isolated PostgreSQL', () => {
  let testDatabase: Awaited<ReturnType<typeof createTestDatabase>>;
  beforeAll(async () => { testDatabase = await createTestDatabase(); }, 30000);
  afterAll(async () => { await testDatabase?.dispose(); }, 30000);
  it('creates snapshots atomically, enforces transitions, filters orders, and computes dashboard totals', async () => {
    const database = createDatabase(testDatabase.url);
    const rollback = new Error('Rollback integration fixtures');
    try {
      await expect(database.db.transaction(async (tx) => {
        const zero = await getDashboardSummary(tx);
        expect(zero).toMatchObject({ totalOrders: 0, revenueCents: 0, pendingOrders: 0, averageOrderValueCents: 0, popularItems: [] });
        expect(zero.ordersPerDay).toHaveLength(7);
        expect(zero.ordersPerDay.every((day) => day.orderCount === 0)).toBe(true);

        const [customer] = await tx.insert(customers).values({ name: 'Order Integration Customer' }).returning();
        const [category] = await tx.insert(menuCategories).values({ name: 'Order Integration Category' }).returning();
        const [a, b, off] = await tx.insert(menuItems).values([
          { categoryId: category.id, name: 'Soup', priceCents: 500 },
          { categoryId: category.id, name: 'Tea', priceCents: 250 },
          { categoryId: category.id, name: 'Unavailable cake', priceCents: 999, isAvailable: false },
        ]).returning();
        const input = { customerId: customer.id, orderType: 'pickup' as const, items: [{ menuItemId: a.id, quantity: 2 }] };
        await expect(createOrder(tx, input)).rejects.toMatchObject({ status: 400 });
        await tx.insert(settings).values({ id: 1, prepTimeMinutes: 20, acceptingOrders: false, autoAcceptOrders: false, openingHours: {} });
        await expect(createOrder(tx, input)).rejects.toMatchObject({ status: 400, message: expect.stringContaining('not accepting') });
        await tx.update(settings).set({ acceptingOrders: true });
        await expect(createOrder(tx, { ...input, customerId: randomUUID() })).rejects.toMatchObject({ status: 404 });
        await expect(createOrder(tx, { ...input, items: [] })).rejects.toMatchObject({ status: 400 });
        await expect(createOrder(tx, { ...input, items: [{ menuItemId: a.id, quantity: 0 }] })).rejects.toMatchObject({ status: 400 });
        await expect(createOrder(tx, { ...input, items: [{ menuItemId: randomUUID(), quantity: 1 }] })).rejects.toMatchObject({ status: 400, message: expect.stringContaining('Unknown menu items') });
        await expect(createOrder(tx, { ...input, items: [{ menuItemId: a.id, quantity: 1 }, { menuItemId: off.id, quantity: 1 }] })).rejects.toMatchObject({ status: 400, message: expect.stringContaining(off.name) });
        await expect(createOrder(tx, { ...input, items: [{ menuItemId: a.id, quantity: 2147483647 }] })).rejects.toMatchObject({ status: 400, message: expect.stringContaining('integer range') });
        expect(await tx.select().from(orders)).toHaveLength(0);
        expect(await tx.select().from(orderItems)).toHaveLength(0);
        expect(createOrderSchema.safeParse({ ...input, totalCents: 1 }).success).toBe(false);

        const first = await createOrder(tx, { ...input, notes: 'literal % match', items: [
          { menuItemId: a.id, quantity: 2 }, { menuItemId: a.id, quantity: 1 }, { menuItemId: b.id, quantity: 3 },
        ] });
        orderDetailSchema.parse(first);
        expect(first).toMatchObject({ status: 'pending', subtotalCents: 2250, totalCents: 2250, allowedActions: ['confirm', 'cancel'] });
        expect(first.items).toHaveLength(2);
        expect(first.items.find((line) => line.menuItemId === a.id)).toMatchObject({ quantity: 3, nameSnapshot: 'Soup', unitPriceCentsSnapshot: 500 });
        await tx.update(menuItems).set({ name: 'Renamed soup', priceCents: 900 }).where(eq(menuItems.id, a.id));
        expect((await getOrder(tx, first.id)).items.find((line) => line.menuItemId === a.id)).toMatchObject({ nameSnapshot: 'Soup', unitPriceCentsSnapshot: 500 });
        await expect(transitionOrder(tx, first.id, { action: 'complete' })).rejects.toMatchObject({ status: 409, allowedActions: ['confirm', 'cancel'] });
        for (const action of ['confirm', 'start_preparing', 'mark_ready', 'complete'] as const) await transitionOrder(tx, first.id, { action });
        expect(await getOrder(tx, first.id)).toMatchObject({ status: 'completed', allowedActions: [] });
        await expect(transitionOrder(tx, first.id, { action: 'cancel' })).rejects.toMatchObject({ status: 409, allowedActions: [] });

        await tx.update(settings).set({ autoAcceptOrders: true });
        const second = await createOrder(tx, { ...input, items: [{ menuItemId: a.id, quantity: 1 }] });
        expect(second).toMatchObject({ status: 'confirmed', totalCents: 900, allowedActions: ['start_preparing', 'cancel'] });
        const oldDate = new Date(Date.now() - 10 * 86400000);
        await tx.update(orders).set({ createdAt: oldDate }).where(eq(orders.id, second.id));
        await tx.update(settings).set({ autoAcceptOrders: false });
        const cancelled = await createOrder(tx, { ...input, items: [{ menuItemId: b.id, quantity: 100 }] });
        expect(await transitionOrder(tx, cancelled.id, { action: 'cancel' })).toMatchObject({ status: 'cancelled', allowedActions: [] });
        const pending = await createOrder(tx, { ...input, orderType: 'delivery', items: [{ menuItemId: b.id, quantity: 2 }] });
        await expect(getOrder(tx, randomUUID())).rejects.toMatchObject({ status: 404 });
        await expect(transitionOrder(tx, randomUUID(), { action: 'confirm' })).rejects.toMatchObject({ status: 404 });

        const filters = orderFiltersSchema.parse({ customerId: customer.id, status: 'pending', orderType: 'delivery' });
        expect((await listOrders(tx, filters)).data.map((order) => order.id)).toEqual([pending.id]);
        expect((await listOrders(tx, orderFiltersSchema.parse({ search: '%' }))).data.map((order) => order.id)).toEqual([first.id]);
        expect((await listOrders(tx, orderFiltersSchema.parse({ search: customer.name }))).total).toBe(4);
        expect((await listOrders(tx, orderFiltersSchema.parse({ search: first.id }))).total).toBe(1);
        const today = new Date().toISOString().slice(0, 10);
        const todayOrders = await listOrders(tx, orderFiltersSchema.parse({ dateFrom: today, dateTo: today }));
        expect(todayOrders.total).toBe(3);
        expect(todayOrders.data.every((order) => Array.isArray(order.allowedActions))).toBe(true);
        const page = await listOrders(tx, orderFiltersSchema.parse({ page: 2, pageSize: 2 }));
        expect(page).toMatchObject({ page: 2, pageSize: 2, total: 4, totalPages: 2 });
        expect(page.data).toHaveLength(2);
        expect(page.data[1].id).toBe(second.id);
        const summary = await getDashboardSummary(tx);
        expect(summary).toMatchObject({ totalOrders: 4, revenueCents: 2250, pendingOrders: 1, averageOrderValueCents: 2250 });
        expect(summary.popularItems).toEqual([
          { menuItemId: b.id, name: 'Tea', quantity: 5 },
          { menuItemId: a.id, name: 'Renamed soup', quantity: 4 },
        ]);
        expect(summary.ordersPerDay.reduce((sum, day) => sum + day.orderCount, 0)).toBe(3);
        expect((await getCustomer(tx, customer.id)).recentOrders.every((order) => Array.isArray(order.allowedActions))).toBe(true);
        throw rollback;
      })).rejects.toBe(rollback);
    } finally { await database.close(); }
  }, 30000);

  it('serializes competing transitions on the same order', async () => {
    const first = createDatabase(testDatabase.url);
    const second = createDatabase(testDatabase.url);
    const customerId = randomUUID();
    const orderId = randomUUID();
    try {
      await first.db.transaction(async (tx) => {
        await tx.insert(customers).values({ id: customerId, name: 'Concurrent transition check' });
        await tx.insert(orders).values({ id: orderId, customerId, orderType: 'pickup', subtotalCents: 0, totalCents: 0 });
      });
      const results = await Promise.allSettled([
        transitionOrder(first.db, orderId, { action: 'confirm' }),
        transitionOrder(second.db, orderId, { action: 'confirm' }),
      ]);
      expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
      const failed = results.find((result) => result.status === 'rejected');
      expect(failed?.status === 'rejected' && failed.reason).toMatchObject({ status: 409, allowedActions: ['start_preparing', 'cancel'] });
      expect((await getOrder(first.db, orderId)).status).toBe('confirmed');
    } finally {
      await first.db.transaction(async (tx) => {
        await tx.delete(orders).where(eq(orders.id, orderId));
        await tx.delete(customers).where(eq(customers.id, customerId));
      });
      await Promise.all([first.close(), second.close()]);
    }
  }, 30000);
});
