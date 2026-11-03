import { OpenAPIHono } from '@hono/zod-openapi';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppEnv } from '../index';
import * as service from '../services/menu';
import { ServiceError } from '../services/errors';
import menuRoutes from './menu';

vi.mock('../services/menu', () => ({
  listCategories: vi.fn(), createCategory: vi.fn(), updateCategory: vi.fn(), deleteCategory: vi.fn(),
  listItems: vi.fn(), createItem: vi.fn(), updateItem: vi.fn(), deleteItem: vi.fn(),
}));

const id = '11111111-1111-4111-8111-111111111111';
const app = new OpenAPIHono<AppEnv>();
app.use('*', async (c, next) => {
  c.set('db', {} as AppEnv['Variables']['db']);
  await next();
});
app.route('/', menuRoutes);
const json = (method: string, body: unknown) => ({
  method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
});
beforeEach(() => vi.resetAllMocks());

describe('Menu routes', () => {
  it('parses false availability correctly and combines it with category filtering', async () => {
    vi.mocked(service.listItems).mockResolvedValue([]);
    const response = await app.request(`/menu/items?categoryId=${id}&isAvailable=false`);
    expect(response.status).toBe(200);
    expect(service.listItems).toHaveBeenCalledWith({}, { categoryId: id, isAvailable: false });
  });

  it.each(['isAvailable=0', 'isAvailable=yes', 'categoryId=invalid'])(
    'rejects invalid filters: %s', async (query) => {
      const response = await app.request(`/menu/items?${query}`);
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ message: expect.any(String) });
      expect(service.listItems).not.toHaveBeenCalled();
    },
  );

  it.each([
    ['/menu/categories', { name: ' ' }],
    ['/menu/categories', { name: 'Lunch', id }],
    ['/menu/items', { name: 'Soup', categoryId: id, priceCents: -1 }],
    ['/menu/items', { name: 'Soup', categoryId: id, priceCents: 1.5 }],
  ])('rejects invalid creation at %s', async (path, body) => {
    const response = await app.request(path, json('POST', body));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: expect.any(String) });
  });

  it('rejects an empty patch and invalid IDs before calling the service', async () => {
    expect((await app.request(`/menu/items/${id}`, json('PATCH', {}))).status).toBe(400);
    expect((await app.request('/menu/categories/bad-id', { method: 'DELETE' })).status).toBe(400);
    expect(service.updateItem).not.toHaveBeenCalled();
    expect(service.deleteCategory).not.toHaveBeenCalled();
  });

  it('does not insert defaults for absent patch fields', async () => {
    vi.mocked(service.updateItem).mockResolvedValue({
      id, categoryId: id, name: 'Soup', description: null, priceCents: 500,
      isAvailable: false, createdAt: '2026-11-01T00:00:00.000Z', updatedAt: '2026-11-01T00:00:00.000Z',
    });
    expect((await app.request(`/menu/items/${id}`, json('PATCH', { isAvailable: false }))).status).toBe(200);
    expect(service.updateItem).toHaveBeenCalledWith({}, id, { isAvailable: false });
  });

  it('returns the shared error shape for malformed JSON', async () => {
    const response = await app.request('/menu/categories', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: '{',
    });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: expect.any(String) });
  });

  it('returns missing resource errors as 404', async () => {
    vi.mocked(service.updateCategory).mockRejectedValue(new ServiceError(404, 'Menu category not found.'));
    const response = await app.request(`/menu/categories/${id}`, json('PATCH', { name: 'Lunch' }));
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ message: 'Menu category not found.' });
  });

  it('preserves the actionable item deletion error', async () => {
    const message = 'Cannot delete a menu item used in orders. Mark it unavailable instead.';
    vi.mocked(service.deleteItem).mockRejectedValue(new ServiceError(400, message));
    const response = await app.request(`/menu/items/${id}`, { method: 'DELETE' });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message });
  });

  it('maps wrapped foreign key violations to a shared 400 error', async () => {
    vi.mocked(service.createItem).mockRejectedValue(new Error('query failed', { cause: { code: '23503' } }));
    const response = await app.request('/menu/items', json('POST', { name: 'Soup', categoryId: id, priceCents: 500 }));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: 'Referenced menu category does not exist.' });
  });

  it('documents all eight operations with tags and shared error responses', () => {
    const document = app.getOpenAPI31Document({ openapi: '3.1.0', info: { title: 'Test', version: '1' } });
    const operations = Object.values(document.paths ?? {}).flatMap((path) =>
      Object.entries(path ?? {}).filter(([method]) => ['get', 'post', 'patch', 'delete'].includes(method)).map(([, operation]) => operation),
    );
    expect(operations).toHaveLength(8);
    const ids = new Set();
    for (const operation of operations) {
      expect(operation).toMatchObject({ operationId: expect.any(String), tags: ['Menu'] });
      const value = operation as { operationId: string; responses: Record<string, unknown> };
      ids.add(value.operationId);
      expect(value.responses).toHaveProperty('200');
      for (const status of ['400', '404']) {
        expect(value.responses[status]).toMatchObject({ content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } });
      }
    }
    expect(ids.size).toBe(8);
  });
});
