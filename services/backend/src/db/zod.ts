import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from '@hono/zod-openapi';
import { orderActions } from '../services/orderStateMachine';
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

export const orderActionSchema = z.enum(orderActions);
export const errorSchema = z.object({ message: z.string(), allowedActions: orderActionSchema.array().optional() }).openapi('Error');
export const menuIdParamsSchema = selectMenuCategorySchema.pick({ id: true });
export const createMenuCategorySchema = insertMenuCategorySchema
  .pick({ name: true, sortOrder: true })
  .extend({ name: insertMenuCategorySchema.shape.name.trim().min(1) }).strict();
export const updateMenuCategorySchema = createMenuCategorySchema.partial()
  .refine((value) => Object.keys(value).length > 0, 'Provide at least one field.');
export const createMenuItemSchema = insertMenuItemSchema
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    name: insertMenuItemSchema.shape.name.trim().min(1),
    priceCents: insertMenuItemSchema.shape.priceCents.min(0),
  }).strict();
export const updateMenuItemSchema = createMenuItemSchema.partial()
  .refine((value) => Object.keys(value).length > 0, 'Provide at least one field.');
export const menuItemFiltersSchema = selectMenuItemSchema.pick({ categoryId: true }).partial()
  .extend({ isAvailable: z.enum(['true', 'false']).transform((value) => value === 'true').optional() });

// Database timestamps are Dates; HTTP JSON encodes them as ISO strings.
const jsonTimestamps = { createdAt: z.iso.datetime(), updatedAt: z.iso.datetime() };
export const menuCategoryResponseSchema = selectMenuCategorySchema
  .omit({ createdAt: true, updatedAt: true }).extend(jsonTimestamps).openapi('MenuCategory');
export const menuItemResponseSchema = selectMenuItemSchema
  .omit({ createdAt: true, updatedAt: true }).extend(jsonTimestamps).openapi('MenuItem');

export const customerIdParamsSchema = selectCustomerSchema.pick({ id: true });
export const createCustomerSchema = insertCustomerSchema
  .pick({ name: true, phone: true, email: true })
  .extend({
    name: insertCustomerSchema.shape.name.trim().min(1),
    phone: selectCustomerSchema.shape.phone.unwrap().trim().min(1).nullable().optional(),
    email: selectCustomerSchema.shape.email.unwrap().trim().email().nullable().optional(),
  }).strict();
export const updateCustomerSchema = createCustomerSchema.partial()
  .refine((value) => Object.keys(value).length > 0, 'Provide at least one field.');
export const customerResponseSchema = selectCustomerSchema
  .omit({ createdAt: true, updatedAt: true }).extend(jsonTimestamps).openapi('Customer');
export const customerSummarySchema = customerResponseSchema.extend({
  orderCount: z.number().int().nonnegative().describe('All orders, including cancelled orders.'),
  totalSpentCents: z.number().int().nonnegative().describe('Sum of totals excluding cancelled orders.'),
  lastOrderAt: z.iso.datetime().nullable().describe('Latest order timestamp, including cancelled orders.'),
}).openapi('CustomerSummary');
export const recentOrderSchema = selectOrderSchema
  .omit({ createdAt: true, updatedAt: true }).extend({
    ...jsonTimestamps, allowedActions: orderActionSchema.array(),
  }).openapi('Order');
export const customerDetailSchema = customerSummarySchema.extend({
  recentOrders: recentOrderSchema.array().max(10).describe('Up to 10 latest orders, newest first.'),
}).openapi('CustomerDetail');

const openingTimeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:mm in 24-hour time.');
const openingDaySchema = z.object({ open: openingTimeSchema, close: openingTimeSchema, closed: z.boolean().optional() }).strict();
export const openingHoursSchema = z.object({
  monday: openingDaySchema, tuesday: openingDaySchema, wednesday: openingDaySchema,
  thursday: openingDaySchema, friday: openingDaySchema, saturday: openingDaySchema,
  sunday: openingDaySchema,
}).strict().openapi('OpeningHours');
export const updateSettingsSchema = selectSettingsSchema.omit({ id: true }).extend({
  prepTimeMinutes: selectSettingsSchema.shape.prepTimeMinutes.min(0).max(240),
  openingHours: openingHoursSchema,
}).strict();
export const settingsResponseSchema = selectSettingsSchema.extend({
  openingHours: openingHoursSchema,
}).openapi('Settings');

export const orderIdParamsSchema = selectOrderSchema.pick({ id: true });
export const createOrderLineSchema = insertOrderItemSchema.pick({ menuItemId: true, quantity: true })
  .extend({ quantity: insertOrderItemSchema.shape.quantity.min(1) }).strict();
export const createOrderSchema = insertOrderSchema.pick({ customerId: true, orderType: true, notes: true })
  .extend({ items: createOrderLineSchema.array().min(1).max(100) }).strict();
export const transitionOrderSchema = selectOrderSchema.pick({}).extend({ action: orderActionSchema }).strict();
export const orderDetailSchema = recentOrderSchema.extend({
  items: selectOrderItemSchema.array(), customer: customerResponseSchema,
}).openapi('OrderDetail');

const dateFilterSchema = z.union([z.iso.date(), z.iso.datetime({ offset: true })]);
export const orderFiltersSchema = selectOrderSchema.pick({ status: true, orderType: true, customerId: true }).partial()
  .extend({
    dateFrom: dateFilterSchema.optional(), dateTo: dateFilterSchema.optional(),
    search: z.string().trim().max(200).optional(),
    page: z.coerce.number().int().min(1).max(1000000).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
  }).refine((value) => {
    if (!value.dateFrom || !value.dateTo) return true;
    const start = new Date(value.dateFrom).getTime();
    const end = new Date(value.dateTo).getTime();
    return value.dateTo.length === 10 ? start < end + 86400000 : start <= end;
  }, 'dateFrom must not be after dateTo.');
export const orderListSchema = recentOrderSchema.pick({}).extend({
  data: recentOrderSchema.array(), page: z.number().int(), pageSize: z.number().int(),
  total: z.number().int().nonnegative(), totalPages: z.number().int().nonnegative(),
}).openapi('OrderList');
const popularItemSchema = selectOrderItemSchema.pick({ menuItemId: true }).extend({
  name: selectMenuItemSchema.shape.name,
  quantity: z.number().int().nonnegative(),
});
const ordersPerDaySchema = selectOrderSchema.pick({}).extend({
  date: z.iso.date(), orderCount: z.number().int().nonnegative(),
});
export const dashboardSummarySchema = selectOrderSchema.pick({}).extend({
  totalOrders: z.number().int().nonnegative(),
  revenueCents: z.number().int().nonnegative().describe('Completed orders only.'),
  pendingOrders: z.number().int().nonnegative(),
  averageOrderValueCents: z.number().int().nonnegative().describe('Completed-order average, rounded to integer cents; zero when none.'),
  popularItems: popularItemSchema.array().max(5).describe('Top items by quantity, excluding cancelled orders.'),
  ordersPerDay: ordersPerDaySchema.array().length(7).describe('Last seven UTC calendar days, including today and zero-count days.'),
}).openapi('DashboardSummary');

