import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import {
  createMenuCategorySchema, createMenuItemSchema, errorSchema,
  menuCategoryResponseSchema, menuIdParamsSchema, menuItemFiltersSchema,
  menuItemResponseSchema, updateMenuCategorySchema, updateMenuItemSchema,
} from '../db/zod';
import type { AppEnv } from '../index';
import * as menu from '../services/menu';
import { postgresErrorCode, ServiceError } from '../services/errors';

const routes = new OpenAPIHono<AppEnv>({
  defaultHook: (result, c) => {
    if (!result.success) return c.json({ message: result.error.issues.map((issue) => issue.message).join('; ') }, 400);
  },
});

routes.onError((error, c) => {
  if (error instanceof ServiceError) return c.json({ message: error.message }, error.status);
  const code = postgresErrorCode(error);
  if (code === '23503') return c.json({ message: 'Referenced menu category does not exist.' }, 400);
  if (code === '23514' || code === '23502' || code === '22003') return c.json({ message: 'Invalid menu data.' }, 400);
  if ('status' in error && error.status === 400) return c.json({ message: 'Invalid request body.' }, 400);
  console.error('Menu request failed', error);
  return c.json({ message: 'Internal server error.' }, 500);
});

const errors = {
  400: { description: 'Invalid request or operation rejected.', content: { 'application/json': { schema: errorSchema } } },
  404: { description: 'Resource not found.', content: { 'application/json': { schema: errorSchema } } },
};
const categoryResponses = { 200: { description: 'Menu category.', content: { 'application/json': { schema: menuCategoryResponseSchema } } }, ...errors };
const itemResponses = { 200: { description: 'Menu item.', content: { 'application/json': { schema: menuItemResponseSchema } } }, ...errors };
const params = menuIdParamsSchema;

routes.openapi(createRoute({
  method: 'get', path: '/menu/categories', operationId: 'listMenuCategories', tags: ['Menu'],
  responses: { 200: { description: 'Menu categories in display order.', content: { 'application/json': { schema: menuCategoryResponseSchema.array() } } }, ...errors },
}), async (c) => c.json(await menu.listCategories(c.get('db')), 200));

routes.openapi(createRoute({
  method: 'post', path: '/menu/categories', operationId: 'createMenuCategory', tags: ['Menu'],
  request: { body: { required: true, content: { 'application/json': { schema: createMenuCategorySchema } } } }, responses: categoryResponses,
}), async (c) => c.json(await menu.createCategory(c.get('db'), c.req.valid('json')), 200));

routes.openapi(createRoute({
  method: 'patch', path: '/menu/categories/{id}', operationId: 'updateMenuCategory', tags: ['Menu'],
  request: { params, body: { required: true, content: { 'application/json': { schema: updateMenuCategorySchema } } } }, responses: categoryResponses,
}), async (c) => c.json(await menu.updateCategory(c.get('db'), c.req.valid('param').id, c.req.valid('json')), 200));

routes.openapi(createRoute({
  method: 'delete', path: '/menu/categories/{id}', operationId: 'deleteMenuCategory', tags: ['Menu'],
  request: { params }, responses: categoryResponses,
}), async (c) => c.json(await menu.deleteCategory(c.get('db'), c.req.valid('param').id), 200));

routes.openapi(createRoute({
  method: 'get', path: '/menu/items', operationId: 'listMenuItems', tags: ['Menu'],
  request: { query: menuItemFiltersSchema },
  responses: { 200: { description: 'Filtered menu items.', content: { 'application/json': { schema: menuItemResponseSchema.array() } } }, ...errors },
}), async (c) => c.json(await menu.listItems(c.get('db'), c.req.valid('query')), 200));

routes.openapi(createRoute({
  method: 'post', path: '/menu/items', operationId: 'createMenuItem', tags: ['Menu'],
  request: { body: { required: true, content: { 'application/json': { schema: createMenuItemSchema } } } }, responses: itemResponses,
}), async (c) => c.json(await menu.createItem(c.get('db'), c.req.valid('json')), 200));

routes.openapi(createRoute({
  method: 'patch', path: '/menu/items/{id}', operationId: 'updateMenuItem', tags: ['Menu'],
  request: { params, body: { required: true, content: { 'application/json': { schema: updateMenuItemSchema } } } }, responses: itemResponses,
}), async (c) => c.json(await menu.updateItem(c.get('db'), c.req.valid('param').id, c.req.valid('json')), 200));

routes.openapi(createRoute({
  method: 'delete', path: '/menu/items/{id}', operationId: 'deleteMenuItem', tags: ['Menu'],
  request: { params }, responses: itemResponses,
}), async (c) => c.json(await menu.deleteItem(c.get('db'), c.req.valid('param').id), 200));

export default routes;
