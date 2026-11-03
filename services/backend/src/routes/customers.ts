import { createRoute } from '@hono/zod-openapi';
import {
  createCustomerSchema, customerDetailSchema, customerIdParamsSchema,
  customerResponseSchema, customerSummarySchema, updateCustomerSchema,
} from '../db/zod';
import * as customers from '../services/customers';
import { createApiRoutes, errorResponses } from './shared';

const routes = createApiRoutes();
const customerResponses = {
  200: { description: 'Customer.', content: { 'application/json': { schema: customerResponseSchema } } },
  ...errorResponses,
};

routes.openapi(createRoute({
  method: 'get', path: '/customers', operationId: 'listCustomers', tags: ['Customers'],
  responses: {
    200: { description: 'Customers with SQL-computed order counts, spend excluding cancelled orders, and latest order time.', content: { 'application/json': { schema: customerSummarySchema.array() } } },
    ...errorResponses,
  },
}), async (c) => c.json(await customers.listCustomers(c.get('db')), 200));

routes.openapi(createRoute({
  method: 'get', path: '/customers/{id}', operationId: 'getCustomer', tags: ['Customers'],
  request: { params: customerIdParamsSchema },
  responses: {
    200: { description: 'Customer summary and up to 10 most recent orders, newest first.', content: { 'application/json': { schema: customerDetailSchema } } },
    ...errorResponses,
  },
}), async (c) => c.json(await customers.getCustomer(c.get('db'), c.req.valid('param').id), 200));

routes.openapi(createRoute({
  method: 'post', path: '/customers', operationId: 'createCustomer', tags: ['Customers'],
  request: { body: { required: true, content: { 'application/json': { schema: createCustomerSchema } } } },
  responses: customerResponses,
}), async (c) => c.json(await customers.createCustomer(c.get('db'), c.req.valid('json')), 200));

routes.openapi(createRoute({
  method: 'patch', path: '/customers/{id}', operationId: 'updateCustomer', tags: ['Customers'],
  request: { params: customerIdParamsSchema, body: { required: true, content: { 'application/json': { schema: updateCustomerSchema } } } },
  responses: customerResponses,
}), async (c) => c.json(await customers.updateCustomer(c.get('db'), c.req.valid('param').id, c.req.valid('json')), 200));

export default routes;
