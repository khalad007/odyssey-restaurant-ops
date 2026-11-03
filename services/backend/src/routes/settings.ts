import { createRoute } from '@hono/zod-openapi';
import { settingsResponseSchema, updateSettingsSchema } from '../db/zod';
import * as settings from '../services/settings';
import { createApiRoutes, errorResponses } from './shared';

const routes = createApiRoutes();
const responses = {
  200: { description: 'Restaurant settings.', content: { 'application/json': { schema: settingsResponseSchema } } },
  ...errorResponses,
};

routes.openapi(createRoute({
  method: 'get', path: '/settings', operationId: 'getSettings', tags: ['Settings'], responses,
}), async (c) => c.json(await settings.getSettings(c.get('db')), 200));

routes.openapi(createRoute({
  method: 'put', path: '/settings', operationId: 'updateSettings', tags: ['Settings'],
  request: { body: { required: true, content: { 'application/json': { schema: updateSettingsSchema } } } }, responses,
}), async (c) => c.json(await settings.updateSettings(c.get('db'), c.req.valid('json')), 200));

export default routes;
