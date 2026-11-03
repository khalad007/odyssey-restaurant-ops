import { OpenAPIHono } from '@hono/zod-openapi';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDatabase } from './db/client';
import { insertOrderItemSchema } from './db/zod';
import app, { openApiConfig } from './index';

vi.mock('./db/client', () => ({
  createDatabase: vi.fn(() => ({ db: {}, close: vi.fn().mockResolvedValue(undefined) })),
}));

const env = { DATABASE_URL: 'postgres://postgres:postgres@localhost:5432/odyssey' };
afterEach(() => vi.clearAllMocks());

describe('Worker routes', () => {
  it('returns a bodyless health response and closes each request client', async () => {
    for (let i = 0; i < 2; i++) {
      const response = await app.request('/health', {}, env);
      expect(response.status).toBe(204);
      expect(await response.text()).toBe('');
    }
    expect(createDatabase).toHaveBeenCalledTimes(2);
    expect(createDatabase).toHaveBeenCalledWith(env.DATABASE_URL);
    for (const result of vi.mocked(createDatabase).mock.results) {
      expect(result.value.close).toHaveBeenCalledOnce();
    }
  });

  it('serves the same document as offline generation', async () => {
    const response = await app.request('/openapi.json', {}, env);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(app.getOpenAPI31Document(openApiConfig));
  });

  it('closes the client for an unmatched route', async () => {
    const response = await app.request('/missing', {}, env);
    expect(response.status).toBe(404);
    expect(vi.mocked(createDatabase).mock.results[0].value.close).toHaveBeenCalledOnce();
  });

  it('generates OpenAPI from a drizzle-zod schema without redefining its fields', () => {
    const contract = new OpenAPIHono();
    contract.openAPIRegistry.register('OrderItemInsert', insertOrderItemSchema);
    const document = contract.getOpenAPI31Document(openApiConfig);
    expect(document.components?.schemas?.OrderItemInsert).toMatchObject({
      type: 'object',
      required: expect.arrayContaining(['orderId', 'menuItemId', 'quantity', 'nameSnapshot', 'unitPriceCentsSnapshot']),
    });
  });
});
