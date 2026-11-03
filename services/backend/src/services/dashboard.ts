import { asc, desc, eq, ne, sql } from 'drizzle-orm';
import { menuItems, orderItems, orders } from '../db/schema';
import { dashboardSummarySchema } from '../db/zod';
import type { Database } from './shared';

export async function getDashboardSummary(db: Database) {
  return db.transaction(async (tx) => {
    const [totals] = await tx.select({
      totalOrders: sql<number>`count(*)`.mapWith(Number),
      revenueCents: sql<number>`coalesce(sum(${orders.totalCents}) filter (where ${orders.status} = 'completed'), 0)`.mapWith(Number),
      pendingOrders: sql<number>`count(*) filter (where ${orders.status} = 'pending')`.mapWith(Number),
      averageOrderValueCents: sql<number>`coalesce(round(avg(${orders.totalCents}) filter (where ${orders.status} = 'completed')), 0)`.mapWith(Number),
    }).from(orders);
    const popularItems = await tx.select({
      menuItemId: orderItems.menuItemId, name: menuItems.name,
      quantity: sql<number>`sum(${orderItems.quantity})`.mapWith(Number),
    }).from(orderItems).innerJoin(orders, eq(orders.id, orderItems.orderId))
      .innerJoin(menuItems, eq(menuItems.id, orderItems.menuItemId))
      .where(ne(orders.status, 'cancelled')).groupBy(orderItems.menuItemId, menuItems.name)
      .orderBy(desc(sql`sum(${orderItems.quantity})`), asc(orderItems.menuItemId)).limit(5);
    const daily = await tx.execute(sql`
      select to_char(day, 'YYYY-MM-DD') as date, count(o.id)::int as "orderCount"
      from generate_series(
        date_trunc('day', now() at time zone 'UTC') - interval '6 days',
        date_trunc('day', now() at time zone 'UTC'), interval '1 day'
      ) as day
      left join ${orders} o on o.created_at >= (day at time zone 'UTC')
        and o.created_at < ((day + interval '1 day') at time zone 'UTC')
      group by day order by day
    `);
    return dashboardSummarySchema.parse({ ...totals, popularItems, ordersPerDay: [...daily] });
  }, { isolationLevel: 'repeatable read', accessMode: 'read only' });
}
