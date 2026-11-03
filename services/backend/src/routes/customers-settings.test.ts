import { OpenAPIHono } from '@hono/zod-openapi';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppEnv } from '../index';
import * as customers from '../services/customers';
import * as settings from '../services/settings';
import { ServiceError } from '../services/errors';
import customerRoutes from './customers';
import settingsRoutes from './settings';

vi.mock('../services/customers', () => ({
  listCustomers: vi.fn(), getCustomer: vi.fn(), createCustomer: vi.fn(), updateCustomer: vi.fn(),
}));
vi.mock('../services/settings', () => ({ getSettings: vi.fn(), updateSettings: vi.fn() }));

const id = '11111111-1111-4111-8111-111111111111';
const customer = { id, name: 'Amina', email: null, phone: null, createdAt: '2026-11-01T00:00:00.000Z', updatedAt: '2026-11-01T00:00:00.000Z' };
const openingHours = {
  monday: { open: '09:00', close: '22:00' }, tuesday: { open: '09:00', close: '22:00' },
  wednesday: { open: '09:00', close: '22:00' }, thursday: { open: '09:00', close: '22:00' },
  friday: { open: '09:00', close: '22:00' }, saturday: { open: '09:00', close: '22:00' },
  sunday: { open: '09:00', close: '22:00' },
};
const settingsBody = { prepTimeMinutes: 20, autoAcceptOrders: false, acceptingOrders: true, openingHours };
const app = new OpenAPIHono<AppEnv>();
app.use('*', async (c, next) => { c.set('db', {} as AppEnv['Variables']['db']); await next(); });
app.route('/', customerRoutes);
app.route('/', settingsRoutes);
const json = (method: string, body: unknown) => ({ method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
beforeEach(() => vi.resetAllMocks());

describe('Customer routes', () => {
  it('returns aggregates and delegates listing to the service', async () => {
    const summary = { ...customer, orderCount: 0, totalSpentCents: 0, lastOrderAt: null };
    vi.mocked(customers.listCustomers).mockResolvedValue([summary]);
    const response = await app.request('/customers');
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([summary]);
  });
  it('returns recent orders from the detail service', async () => {
    const detail = { ...customer, orderCount: 0, totalSpentCents: 0, lastOrderAt: null, recentOrders: [] };
    vi.mocked(customers.getCustomer).mockResolvedValue(detail);
    const response = await app.request(`/customers/${id}`);
    expect(await response.json()).toEqual(detail);
    expect(customers.getCustomer).toHaveBeenCalledWith({}, id);
  });
  it.each([{ name: ' ' }, { name: 'Amina', email: 'bad-email' }, { name: 'Amina', phone: '' }, { name: 'Amina', orderCount: 2 }])(
    'rejects invalid or noneditable customer data: %j', async (body) => {
      const response = await app.request('/customers', json('POST', body));
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ message: expect.any(String) });
      expect(customers.createCustomer).not.toHaveBeenCalled();
    },
  );
  it('allows nullable contacts and trims the name on creation', async () => {
    vi.mocked(customers.createCustomer).mockResolvedValue(customer);
    const response = await app.request('/customers', json('POST', { name: ' Amina ', phone: null, email: null }));
    expect(response.status).toBe(200);
    expect(customers.createCustomer).toHaveBeenCalledWith({}, { name: 'Amina', phone: null, email: null });
  });
  it('preserves omitted fields on patch', async () => {
    vi.mocked(customers.updateCustomer).mockResolvedValue(customer);
    expect((await app.request(`/customers/${id}`, json('PATCH', { phone: null }))).status).toBe(200);
    expect(customers.updateCustomer).toHaveBeenCalledWith({}, id, { phone: null });
    expect((await app.request(`/customers/${id}`, json('PATCH', {}))).status).toBe(400);
  });
  it('returns shared 400 and 404 errors', async () => {
    expect((await app.request('/customers/not-a-uuid')).status).toBe(400);
    vi.mocked(customers.getCustomer).mockRejectedValue(new ServiceError(404, 'Customer not found.'));
    const response = await app.request(`/customers/${id}`);
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ message: 'Customer not found.' });
  });
});

describe('Settings routes', () => {
  it('returns settings', async () => {
    vi.mocked(settings.getSettings).mockResolvedValue({ id: 1, ...settingsBody });
    const response = await app.request('/settings');
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ id: 1, ...settingsBody });
  });
  it.each([0, 240])('accepts the prep time boundary %i', async (prepTimeMinutes) => {
    const body = { ...settingsBody, prepTimeMinutes };
    vi.mocked(settings.updateSettings).mockResolvedValue({ id: 1, ...body });
    expect((await app.request('/settings', json('PUT', body))).status).toBe(200);
    expect(settings.updateSettings).toHaveBeenCalledWith({}, body);
  });
  it.each([-1, 241, 1.5])('rejects invalid prep time %s', async (prepTimeMinutes) => {
    const response = await app.request('/settings', json('PUT', { ...settingsBody, prepTimeMinutes }));
    expect(response.status).toBe(400);
    expect(settings.updateSettings).not.toHaveBeenCalled();
  });
  it.each(['24:00', '9:00', '12:60', 'not-a-time'])('rejects invalid opening time %s', async (open) => {
    const response = await app.request('/settings', json('PUT', {
      ...settingsBody, openingHours: { ...openingHours, monday: { open, close: '22:00' } },
    }));
    expect(response.status).toBe(400);
  });
  it('requires exactly seven days and full PUT fields', async () => {
    const sixDays: Partial<typeof openingHours> = { ...openingHours };
    delete sixDays.sunday;
    expect((await app.request('/settings', json('PUT', { ...settingsBody, openingHours: sixDays }))).status).toBe(400);
    expect((await app.request('/settings', json('PUT', { ...settingsBody, openingHours: { ...openingHours, holiday: openingHours.monday } }))).status).toBe(400);
    expect((await app.request('/settings', json('PUT', { prepTimeMinutes: 20 }))).status).toBe(400);
    expect((await app.request('/settings', json('PUT', { ...settingsBody, id: 2 }))).status).toBe(400);
  });
  it('returns shared errors for missing settings and malformed JSON', async () => {
    vi.mocked(settings.getSettings).mockRejectedValue(new ServiceError(404, 'Settings not found.'));
    const response = await app.request('/settings');
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ message: 'Settings not found.' });
    const malformed = await app.request('/settings', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: '{' });
    expect(malformed.status).toBe(400);
    expect(await malformed.json()).toEqual({ message: expect.any(String) });
  });
});

it('documents all six operations with tags, operation IDs, and shared errors', () => {
  const document = app.getOpenAPI31Document({ openapi: '3.1.0', info: { title: 'Test', version: '1' } });
  const operations = Object.values(document.paths ?? {}).flatMap((path) =>
    Object.entries(path ?? {}).filter(([method]) => ['get', 'post', 'patch', 'put'].includes(method)).map(([, operation]) => operation),
  );
  expect(operations).toHaveLength(6);
  for (const operation of operations) {
    expect(operation).toMatchObject({ operationId: expect.any(String), tags: expect.arrayContaining([expect.any(String)]) });
    const value = operation as { responses: Record<string, unknown> };
    expect(value.responses).toHaveProperty('200');
    for (const status of ['400', '404']) {
      expect(value.responses[status]).toMatchObject({ content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } });
    }
  }
});
