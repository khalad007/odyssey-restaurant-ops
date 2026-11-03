import { OpenAPIHono } from '@hono/zod-openapi';
import { errorSchema } from '../db/zod';
import type { AppEnv } from '../index';
import { postgresErrorCode, ServiceError } from '../services/errors';

export const errorResponses = {
  400: { description: 'Invalid request.', content: { 'application/json': { schema: errorSchema } } },
  404: { description: 'Resource not found.', content: { 'application/json': { schema: errorSchema } } },
  409: { description: 'Invalid order transition; includes allowed actions.', content: { 'application/json': { schema: errorSchema } } },
};

export function createApiRoutes() {
  const routes = new OpenAPIHono<AppEnv>({
    defaultHook: (result, c) => {
      if (!result.success) return c.json({ message: result.error.issues.map((issue) => issue.message).join('; ') }, 400);
    },
  });
  routes.onError((error, c) => {
    if (error instanceof ServiceError) return c.json({
      message: error.message,
      ...(error.allowedActions === undefined ? {} : { allowedActions: error.allowedActions }),
    }, error.status);
    if ('status' in error && error.status === 400) return c.json({ message: 'Invalid request body.' }, 400);
    if (['23514', '23502', '22003', '23503'].includes(postgresErrorCode(error) ?? '')) {
      return c.json({ message: 'Invalid data.' }, 400);
    }
    console.error('API request failed', error);
    return c.json({ message: 'Internal server error.' }, 500);
  });
  return routes;
}
