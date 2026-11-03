import { OpenAPIHono } from '@hono/zod-openapi';
import { beforeEach, expect, it, vi } from 'vitest';
import type { AppEnv } from '../index';
import * as orders from '../services/orders';
import { getDashboardSummary } from '../services/dashboard';
import { ServiceError } from '../services/errors';
import orderRoutes from './orders';
import dashboardRoutes from './dashboard';

vi.mock('../services/orders', () => ({ createOrder: vi.fn(), getOrder: vi.fn(), listOrders: vi.fn(), transitionOrder: vi.fn() }));
vi.mock('../services/dashboard', () => ({ getDashboardSummary: vi.fn() }));
const id = '11111111-1111-4111-8111-111111111111';
const input = { customerId: id, orderType: 'pickup', items: [{ menuItemId: id, quantity: 2 }] };
const app = new OpenAPIHono<AppEnv>();
app.use('*', async (c, next) => { c.set('db', {} as AppEnv['Variables']['db']); await next(); });
app.route('/', orderRoutes);
app.route('/', dashboardRoutes);
const json = (body: unknown) => ({ method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
beforeEach(() => vi.resetAllMocks());

it.each([
  { ...input, items: [] },
  { ...input, items: [{ menuItemId: id, quantity: 0 }] },
  { ...input, items: [{ menuItemId: id, quantity: 1.5 }] },
  { ...input, items: [{ menuItemId: 'bad', quantity: 1 }] },
  { ...input, totalCents: 1 }, { ...input, subtotalCents: 1 }, { ...input, status: 'completed' },
  { ...input, items: [{ menuItemId: id, quantity: 1, unitPriceCentsSnapshot: 1 }] },
])('rejects invalid quantities, empty items, and client-controlled fields: %j', async (body) => {
  const response = await app.request('/orders', json(body));
  expect(response.status).toBe(400);
  expect(await response.json()).toEqual({ message: expect.any(String) });
  expect(orders.createOrder).not.toHaveBeenCalled();
});

it('passes validated filters and pagination to the service', async () => {
  vi.mocked(orders.listOrders).mockResolvedValue({ data: [], page: 2, pageSize: 5, total: 0, totalPages: 0 });
  const response = await app.request(`/orders?status=pending&orderType=pickup&customerId=${id}&dateFrom=2026-11-01&dateTo=2026-11-04&search=Amina&page=2&pageSize=5`);
  expect(response.status).toBe(200);
  expect(orders.listOrders).toHaveBeenCalledWith({}, {
    status: 'pending', orderType: 'pickup', customerId: id, dateFrom: '2026-11-01', dateTo: '2026-11-04', search: 'Amina', page: 2, pageSize: 5,
  });
});

it('allows an intraday timestamp through an inclusive date-only upper bound', async () => {
  vi.mocked(orders.listOrders).mockResolvedValue({ data: [], page: 1, pageSize: 20, total: 0, totalPages: 0 });
  expect((await app.request('/orders?dateFrom=2026-11-01T12:00:00Z&dateTo=2026-11-01')).status).toBe(200);
});

it.each(['status=bad', 'orderType=bad', 'customerId=bad', 'page=0', 'pageSize=101', 'dateFrom=yesterday', 'dateFrom=2026-11-04&dateTo=2026-11-01'])(
  'rejects invalid order filters: %s', async (query) => {
    expect((await app.request(`/orders?${query}`)).status).toBe(400);
    expect(orders.listOrders).not.toHaveBeenCalled();
  },
);

it.each([{ status: 'confirmed' }, { action: 'confirm', status: 'confirmed' }, { action: 'invalid' }])(
  'requires only a valid action on transitions: %j', async (body) => {
    expect((await app.request(`/orders/${id}/transition`, json(body))).status).toBe(400);
    expect(orders.transitionOrder).not.toHaveBeenCalled();
  },
);

it('returns a 409 with clear allowed actions', async () => {
  vi.mocked(orders.transitionOrder).mockRejectedValue(new ServiceError(409, 'Cannot complete a pending order.', ['confirm', 'cancel']));
  const response = await app.request(`/orders/${id}/transition`, json({ action: 'complete' }));
  expect(response.status).toBe(409);
  expect(await response.json()).toEqual({ message: 'Cannot complete a pending order.', allowedActions: ['confirm', 'cancel'] });
});

it('returns missing-order errors', async () => {
  vi.mocked(orders.getOrder).mockRejectedValue(new ServiceError(404, 'Order not found.'));
  const response = await app.request(`/orders/${id}`);
  expect(response.status).toBe(404);
  expect(await response.json()).toEqual({ message: 'Order not found.' });
});

it('serves dashboard aggregates from its service', async () => {
  const summary = { totalOrders: 0, revenueCents: 0, pendingOrders: 0, averageOrderValueCents: 0, popularItems: [], ordersPerDay: [] };
  vi.mocked(getDashboardSummary).mockResolvedValue(summary);
  expect((await app.request('/dashboard/summary')).status).toBe(200);
  expect(getDashboardSummary).toHaveBeenCalledOnce();
});

it('documents operations, shared conflict errors, and allowed actions', () => {
  const document = app.getOpenAPI31Document({ openapi: '3.1.0', info: { title: 'Test', version: '1' } });
  const transition = document.paths?.['/orders/{id}/transition']?.post;
  expect(transition?.responses?.['409']).toMatchObject({ content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } });
  expect(document.components?.schemas?.Order).toMatchObject({ required: expect.arrayContaining(['allowedActions']) });
  for (const path of Object.values(document.paths ?? {})) {
    for (const [method, operation] of Object.entries(path ?? {})) {
      if (!['get', 'post'].includes(method)) continue;
      expect(operation).toMatchObject({ operationId: expect.any(String), tags: expect.any(Array) });
    }
  }
});
