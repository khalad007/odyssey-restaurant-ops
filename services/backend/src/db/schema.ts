import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'completed',
  'cancelled',
]);

export const orderTypeEnum = pgEnum('order_type', [
  'dine_in',
  'pickup',
  'delivery',
]);

const timestamps = () => ({
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const menuCategories = pgTable('menu_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  ...timestamps(),
});

export const menuItems = pgTable('menu_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  categoryId: uuid('category_id').notNull().references(() => menuCategories.id),
  name: text('name').notNull(),
  description: text('description'),
  priceCents: integer('price_cents').notNull(),
  isAvailable: boolean('is_available').notNull().default(true),
  ...timestamps(),
}, (table) => [
  check('menu_items_price_nonnegative', sql`${table.priceCents} >= 0`),
]);

export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  phone: text('phone'),
  email: text('email'),
  ...timestamps(),
});

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  orderType: orderTypeEnum('order_type').notNull(),
  status: orderStatusEnum('status').notNull().default('pending'),
  // Computed by server-side order logic; never accepted as client totals.
  subtotalCents: integer('subtotal_cents').notNull(),
  totalCents: integer('total_cents').notNull(),
  notes: text('notes'),
  ...timestamps(),
}, (table) => [
  index('orders_status_idx').on(table.status),
  index('orders_created_at_idx').on(table.createdAt),
  index('orders_customer_id_idx').on(table.customerId),
  check('orders_subtotal_nonnegative', sql`${table.subtotalCents} >= 0`),
  check('orders_total_nonnegative', sql`${table.totalCents} >= 0`),
]);

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  menuItemId: uuid('menu_item_id').notNull().references(() => menuItems.id),
  quantity: integer('quantity').notNull(),
  nameSnapshot: text('name_snapshot').notNull(),
  unitPriceCentsSnapshot: integer('unit_price_cents_snapshot').notNull(),
}, (table) => [
  index('order_items_order_id_idx').on(table.orderId),
  check('order_items_quantity_positive', sql`${table.quantity} > 0`),
  check('order_items_unit_price_nonnegative', sql`${table.unitPriceCentsSnapshot} >= 0`),
]);

export const settings = pgTable('settings', {
  // The primary key and CHECK permit at most one row, always with id = 1.
  id: integer('id').primaryKey().default(1),
  prepTimeMinutes: integer('prep_time_minutes').notNull(),
  autoAcceptOrders: boolean('auto_accept_orders').notNull().default(false),
  acceptingOrders: boolean('accepting_orders').notNull().default(false),
  openingHours: jsonb('opening_hours').notNull(),
}, (table) => [
  check('settings_single_row', sql`${table.id} = 1`),
  check('settings_prep_time_nonnegative', sql`${table.prepTimeMinutes} >= 0`),
]);
