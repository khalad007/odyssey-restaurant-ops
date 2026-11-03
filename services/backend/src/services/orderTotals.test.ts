import { describe, expect, it } from 'vitest';
import { calculateOrderTotals } from './orderTotals';

describe('Order totals without a database', () => {
  it('multiplies each integer-cent price by quantity and sums all lines', () => {
    expect(calculateOrderTotals([
      { quantity: 3, unitPriceCentsSnapshot: 599 },
      { quantity: 2, unitPriceCentsSnapshot: 125 },
    ])).toEqual({ subtotalCents: 2047, totalCents: 2047 });
  });
  it('handles zero-priced items and single-cent prices exactly', () => {
    expect(calculateOrderTotals([
      { quantity: 10, unitPriceCentsSnapshot: 0 },
      { quantity: 3, unitPriceCentsSnapshot: 1 },
    ])).toEqual({ subtotalCents: 3, totalCents: 3 });
  });
  it('accepts the PostgreSQL integer upper bound', () => {
    expect(calculateOrderTotals([{ quantity: 1, unitPriceCentsSnapshot: 2147483647 }])).toEqual({
      subtotalCents: 2147483647, totalCents: 2147483647,
    });
  });
  it('rejects empty orders', () => {
    expect(() => calculateOrderTotals([])).toThrow(expect.objectContaining({ status: 400 }));
  });
  it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, 2147483648])('rejects invalid quantity %s', (quantity) => {
    expect(() => calculateOrderTotals([{ quantity, unitPriceCentsSnapshot: 100 }])).toThrow(expect.objectContaining({ status: 400 }));
  });
  it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])('rejects invalid cent price %s', (unitPriceCentsSnapshot) => {
    expect(() => calculateOrderTotals([{ quantity: 1, unitPriceCentsSnapshot }])).toThrow(expect.objectContaining({ status: 400 }));
  });
  it('rejects overflow caused by multiplication or summing otherwise valid lines', () => {
    expect(() => calculateOrderTotals([{ quantity: 2, unitPriceCentsSnapshot: 2147483647 }])).toThrow(expect.objectContaining({ status: 400 }));
    expect(() => calculateOrderTotals([
      { quantity: 1, unitPriceCentsSnapshot: 2147483647 }, { quantity: 1, unitPriceCentsSnapshot: 1 },
    ])).toThrow(expect.objectContaining({ status: 400 }));
  });
});
