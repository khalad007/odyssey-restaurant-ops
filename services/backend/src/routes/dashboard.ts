import { createRoute } from '@hono/zod-openapi';
import { dashboardSummarySchema } from '../db/zod';
import { getDashboardSummary } from '../services/dashboard';
import { createApiRoutes, errorResponses } from './shared';

const routes = createApiRoutes();
routes.openapi(createRoute({
  method: 'get', path: '/dashboard/summary', operationId: 'getDashboardSummary', tags: ['Dashboard'],
  description: 'All-time totals; completed-only revenue and average order value; noncancelled item popularity; daily counts include every order status over the last seven UTC days.',
  responses: {
    200: { description: 'Dashboard summary.', content: { 'application/json': { schema: dashboardSummarySchema } } },
    ...errorResponses,
  },
}), async (c) => c.json(await getDashboardSummary(c.get('db')), 200));
export default routes;
