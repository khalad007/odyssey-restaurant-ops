import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import { createDatabase } from './db/client';
import type { Database } from './services/shared';
import menuRoutes from './routes/menu';
import customerRoutes from './routes/customers';
import settingsRoutes from './routes/settings';
import orderRoutes from './routes/orders';
import dashboardRoutes from './routes/dashboard';

export type Bindings = { DATABASE_URL: string };

export type AppEnv = {
  Bindings: Bindings;
  Variables: { db: Database };
};

const app = new OpenAPIHono<AppEnv>();

app.use('*', async (c, next) => {
  const database = createDatabase(c.env.DATABASE_URL);
  c.set('db', database.db);
  try {
    await next();
  } finally {
    await database.close();
  }
});

app.openapi(createRoute({
  method: 'get',
  path: '/health',
  operationId: 'getHealth',
  summary: 'Worker liveness check',
  responses: { 204: { description: 'Worker is running; no response body.' } },
}), (c) => c.body(null, 204));

export const openApiConfig = {
  openapi: '3.1.0',
  info: {
    title: 'Odyssey Restaurant Operations API',
    version: '0.1.0',
    description: 'Generated from Hono route declarations. Do not edit generated OpenAPI files.',
  },
};

app.route('/', menuRoutes);
app.route('/', customerRoutes);
app.route('/', settingsRoutes);
app.route('/', orderRoutes);
app.route('/', dashboardRoutes);
app.doc31('/openapi.json', openApiConfig);

export default app;
