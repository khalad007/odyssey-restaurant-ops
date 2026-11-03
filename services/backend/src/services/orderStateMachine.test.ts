import { describe, expect, it } from 'vitest';
import { orderStatusEnum } from '../db/schema';
import { allowedActions, nextStatus, orderActions, type OrderStatus } from './orderStateMachine';

const expected: Record<OrderStatus, Record<string, OrderStatus>> = {
  pending: { confirm: 'confirmed', cancel: 'cancelled' },
  confirmed: { start_preparing: 'preparing', cancel: 'cancelled' },
  preparing: { mark_ready: 'ready', cancel: 'cancelled' },
  ready: { complete: 'completed' }, completed: {}, cancelled: {},
};

describe('Order state machine', () => {
  for (const status of orderStatusEnum.enumValues) {
    it(`exposes the allowed actions for ${status}`, () => {
      expect(allowedActions(status)).toEqual(Object.keys(expected[status]));
    });
    for (const action of orderActions) {
      it(`${status}: ${action}`, () => {
        const next = expected[status][action];
        if (next) expect(nextStatus(status, action)).toBe(next);
        else {
          expect(() => nextStatus(status, action)).toThrow(expect.objectContaining({
            status: 409, allowedActions: Object.keys(expected[status]),
            message: expect.stringContaining(status),
          }));
        }
      });
    }
  }
});
