import { createRoute } from '@hono/zod-openapi';
import {
  createOrderSchema, orderDetailSchema, orderFiltersSchema, orderIdParamsSchema,
  orderListSchema, transitionOrderSchema,
} from '../db/zod';
import * as orders from '../services/orders';
import { createApiRoutes, errorResponses } from './shared';

const routes = createApiRoutes();
const detailResponses = {
  200: { description: 'Order with snapshot items, customer, and allowed actions.', content: { 'application/json': { schema: orderDetailSchema } } },
  ...errorResponses,
};

routes.openapi(createRoute({
  method: 'post', path: '/orders', operationId: 'createOrder', tags: ['Orders'],
  request: { body: { required: true, content: { 'application/json': { schema: createOrderSchema } } } },
  responses: detailResponses,
}), async (c) => c.json(await orders.createOrder(c.get('db'), c.req.valid('json')), 200));

routes.openapi(createRoute({
  method: 'get', path: '/orders', operationId: 'listOrders', tags: ['Orders'],
  description: 'Newest first. dateFrom/dateTo accept ISO dates (inclusive UTC days) or timestamps. Search matches order ID, notes, and customer name/phone/email. Pagination uses page and pageSize.',
  request: { query: orderFiltersSchema },
  responses: {
    200: { description: 'Paginated orders with allowed actions.', content: { 'application/json': { schema: orderListSchema } } },
    ...errorResponses,
  },
}), async (c) => c.json(await orders.listOrders(c.get('db'), c.req.valid('query')), 200));

routes.openapi(createRoute({
  method: 'get', path: '/orders/{id}', operationId: 'getOrder', tags: ['Orders'],
  request: { params: orderIdParamsSchema }, responses: detailResponses,
}), async (c) => c.json(await orders.getOrder(c.get('db'), c.req.valid('param').id), 200));

routes.openapi(createRoute({
  method: 'post', path: '/orders/{id}/transition', operationId: 'transitionOrder', tags: ['Orders'],
  request: { params: orderIdParamsSchema, body: { required: true, content: { 'application/json': { schema: transitionOrderSchema } } } },
  responses: detailResponses,
}), async (c) => c.json(await orders.transitionOrder(c.get('db'), c.req.valid('param').id, c.req.valid('json')), 200));

export default routes;
