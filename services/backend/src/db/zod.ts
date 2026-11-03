import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import {
  customers,
  menuCategories,
  menuItems,
  orderItems,
  orders,
  settings,
} from './schema';

export const insertMenuCategorySchema = createInsertSchema(menuCategories);
export const selectMenuCategorySchema = createSelectSchema(menuCategories);

export const insertMenuItemSchema = createInsertSchema(menuItems);
export const selectMenuItemSchema = createSelectSchema(menuItems);

export const insertCustomerSchema = createInsertSchema(customers);
export const selectCustomerSchema = createSelectSchema(customers);

export const insertOrderSchema = createInsertSchema(orders);
export const selectOrderSchema = createSelectSchema(orders);

export const insertOrderItemSchema = createInsertSchema(orderItems);
export const selectOrderItemSchema = createSelectSchema(orderItems);

export const insertSettingsSchema = createInsertSchema(settings);
export const selectSettingsSchema = createSelectSchema(settings);
