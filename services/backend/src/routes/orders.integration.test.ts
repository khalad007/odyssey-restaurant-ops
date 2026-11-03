import { randomUUID } from 'node:crypto';
import { OpenAPIHono } from '@hono/zod-openapi';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createDatabase } from '../db/client';
import { customers, menuCategories, menuItems, orderItems, orders, settings } from '../db/schema';
import { orderDetailSchema } from '../db/zod';
import type { AppEnv } from '../index';
import type { Database } from '../services/shared';
import { createTestDatabase } from '../test/database';
import orderRoutes from './orders';

type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0];

async function fixtures(tx: Transaction) {
  const [customer] = await tx.insert(customers).values({ name: 'API test customer' }).returning();
  const [category] = await tx.insert(menuCategories).values({ name: 'API test category' }).returning();
  const [soup, tea, cake, pie] = await tx.insert(menuItems).values([
    { categoryId: category.id, name: 'Soup', priceCents: 500 },
    { categoryId: category.id, name: 'Tea', priceCents: 250 },
    { categoryId: category.id, name: 'Cake', priceCents: 700, isAvailable: false },
    { categoryId: category.id, name: 'Pie', priceCents: 800, isAvailable: false },
  ]).returning();
  await tx.insert(settings).values({
    id: 1, prepTimeMinutes: 20, acceptingOrders: true, autoAcceptOrders: false, openingHours: {},
  });
  const app = new OpenAPIHono<AppEnv>();
  app.use('*', async (c, next) => {
    // A transaction supplies all database methods used by the real route services.
    c.set('db', tx);
    await next();
  });
  app.route('/', orderRoutes);
  return { app, tx, customer, soup, tea, cake, pie };
}

const json = (body: unknown) => ({ method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

describe('Order API with real services and isolated PostgreSQL', () => {
  let testDatabase: Awaited<ReturnType<typeof createTestDatabase>>;
  let database: ReturnType<typeof createDatabase>;
  beforeAll(async () => {
    testDatabase = await createTestDatabase();
    database = createDatabase(testDatabase.url);
  }, 30000);
  afterAll(async () => {
    try { await database?.close(); }
    finally { await testDatabase?.dispose(); }
  }, 30000);

  async function withFixtures(run: (data: Awaited<ReturnType<typeof fixtures>>) => Promise<void>) {
    const rollback = new Error('Rollback API test fixtures');
    await expect(database.db.transaction(async (tx) => {
      await run(await fixtures(tx));
      throw rollback;
    })).rejects.toBe(rollback);
    expect(await database.db.select().from(orders)).toHaveLength(0);
    expect(await database.db.select().from(orderItems)).toHaveLength(0);
    expect(await database.db.select().from(customers)).toHaveLength(0);
  }

  it('creates an order using DB prices, stores snapshots, and calculates integer-cent totals', async () => {
    await withFixtures(async ({ app, customer, soup, tea, tx }) => {
      const response = await app.request('/orders', json({ customerId: customer.id, orderType: 'pickup', items: [
        { menuItemId: soup.id, quantity: 2 }, { menuItemId: tea.id, quantity: 3 },
      ] }));
      expect(response.status).toBe(200);
      const order = orderDetailSchema.parse(await response.json());
      expect(order).toMatchObject({ subtotalCents: 1750, totalCents: 1750, status: 'pending', allowedActions: ['confirm', 'cancel'] });
      expect(order.items).toEqual(expect.arrayContaining([
        expect.objectContaining({ menuItemId: soup.id, quantity: 2, nameSnapshot: 'Soup', unitPriceCentsSnapshot: 500 }),
        expect.objectContaining({ menuItemId: tea.id, quantity: 3, nameSnapshot: 'Tea', unitPriceCentsSnapshot: 250 }),
      ]));
      const [stored] = await tx.select().from(orders);
      expect(stored).toMatchObject({ id: order.id, subtotalCents: 1750, totalCents: 1750 });
      expect(await tx.select().from(orderItems)).toHaveLength(2);
    });
  });

  it('rejects unavailable items and lists all unavailable names without partial writes', async () => {
    await withFixtures(async ({ app, customer, soup, cake, pie, tx }) => {
      const response = await app.request('/orders', json({ customerId: customer.id, orderType: 'pickup', items: [
        { menuItemId: soup.id, quantity: 1 }, { menuItemId: cake.id, quantity: 1 }, { menuItemId: pie.id, quantity: 1 },
      ] }));
      expect(response.status).toBe(400);
      const error = await response.json() as { message: string };
      expect(error.message).toContain('Unavailable menu items:');
      expect(error.message).toContain(cake.name);
      expect(error.message).toContain(pie.name);
      expect(await tx.select().from(orders)).toHaveLength(0);
      expect(await tx.select().from(orderItems)).toHaveLength(0);
    });
  });

  it('rejects empty orders', async () => {
    await withFixtures(async ({ app, customer, tx }) => {
      const response = await app.request('/orders', json({ customerId: customer.id, orderType: 'pickup', items: [] }));
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ message: expect.any(String) });
      expect(await tx.select().from(orders)).toHaveLength(0);
    });
  });

  it.each([0, -1, 1.5])('rejects quantity %s', async (quantity) => {
    await withFixtures(async ({ app, customer, soup }) => {
      expect((await app.request('/orders', json({ customerId: customer.id, orderType: 'pickup', items: [{ menuItemId: soup.id, quantity }] }))).status).toBe(400);
    });
  });

  it('rejects unknown menu items without partial writes', async () => {
    await withFixtures(async ({ app, customer, soup, tx }) => {
      const missingId = randomUUID();
      const response = await app.request('/orders', json({ customerId: customer.id, orderType: 'pickup', items: [
        { menuItemId: soup.id, quantity: 1 }, { menuItemId: missingId, quantity: 1 },
      ] }));
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ message: expect.stringContaining(missingId) });
      expect(await tx.select().from(orders)).toHaveLength(0);
      expect(await tx.select().from(orderItems)).toHaveLength(0);
    });
  });

  it('rejects orders when acceptingOrders is false', async () => {
    await withFixtures(async ({ app, customer, soup, tx }) => {
      await tx.update(settings).set({ acceptingOrders: false });
      const response = await app.request('/orders', json({ customerId: customer.id, orderType: 'pickup', items: [{ menuItemId: soup.id, quantity: 1 }] }));
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ message: expect.stringContaining('not accepting orders') });
      expect(await tx.select().from(orders)).toHaveLength(0);
    });
  });

  it('creates a confirmed order when autoAcceptOrders is true', async () => {
    await withFixtures(async ({ app, customer, soup, tx }) => {
      await tx.update(settings).set({ autoAcceptOrders: true });
      const response = await app.request('/orders', json({ customerId: customer.id, orderType: 'pickup', items: [{ menuItemId: soup.id, quantity: 1 }] }));
      expect(response.status).toBe(200);
      expect(orderDetailSchema.parse(await response.json())).toMatchObject({ status: 'confirmed', allowedActions: ['start_preparing', 'cancel'] });
      expect((await tx.select().from(orders))[0].status).toBe('confirmed');
    });
  });

  it('returns 409 and allowed actions for an invalid transition and leaves status unchanged', async () => {
    await withFixtures(async ({ app, customer, soup, tx }) => {
      const created = await app.request('/orders', json({ customerId: customer.id, orderType: 'pickup', items: [{ menuItemId: soup.id, quantity: 1 }] }));
      const order = orderDetailSchema.parse(await created.json());
      const response = await app.request(`/orders/${order.id}/transition`, json({ action: 'complete' }));
      expect(response.status).toBe(409);
      expect(await response.json()).toEqual({ message: expect.stringContaining('pending'), allowedActions: ['confirm', 'cancel'] });
      expect((await tx.select().from(orders))[0].status).toBe('pending');
    });
  });

  it('runs the valid API flow through completion and rejects actions on a final order', async () => {
    await withFixtures(async ({ app, customer, soup }) => {
      const created = await app.request('/orders', json({ customerId: customer.id, orderType: 'pickup', items: [{ menuItemId: soup.id, quantity: 1 }] }));
      const order = orderDetailSchema.parse(await created.json());
      for (const action of ['confirm', 'start_preparing', 'mark_ready', 'complete']) {
        expect((await app.request(`/orders/${order.id}/transition`, json({ action }))).status).toBe(200);
      }
      const completed = await app.request(`/orders/${order.id}`);
      expect(await completed.json()).toMatchObject({ status: 'completed', allowedActions: [] });
      const rejected = await app.request(`/orders/${order.id}/transition`, json({ action: 'cancel' }));
      expect(rejected.status).toBe(409);
      expect(await rejected.json()).toMatchObject({ allowedActions: [] });
    });
  });
});
