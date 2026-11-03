import type { orderItems } from '../db/schema';
import { ServiceError } from './errors';

type PricedLine = Pick<typeof orderItems.$inferSelect, 'quantity' | 'unitPriceCentsSnapshot'>;

export function calculateOrderTotals(lines: readonly PricedLine[]) {
  if (lines.length === 0) throw new ServiceError(400, 'An order must contain at least one item.');
  let subtotalCents = 0;
  for (const line of lines) {
    if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 2147483647
      || !Number.isInteger(line.unitPriceCentsSnapshot) || line.unitPriceCentsSnapshot < 0) {
      throw new ServiceError(400, 'Order quantities and prices must be valid integers.');
    }
    subtotalCents += line.quantity * line.unitPriceCentsSnapshot;
    if (!Number.isSafeInteger(subtotalCents) || subtotalCents > 2147483647) {
      throw new ServiceError(400, 'Order total exceeds the supported integer range.');
    }
  }
  return { subtotalCents, totalCents: subtotalCents };
}
