import { orderStatusEnum } from '../db/schema';
import { ServiceError } from './errors';

export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];
export const orderActions = ['confirm', 'start_preparing', 'mark_ready', 'complete', 'cancel'] as const;
export type OrderAction = (typeof orderActions)[number];

const transitions: Record<OrderStatus, Partial<Record<OrderAction, OrderStatus>>> = {
  pending: { confirm: 'confirmed', cancel: 'cancelled' },
  confirmed: { start_preparing: 'preparing', cancel: 'cancelled' },
  preparing: { mark_ready: 'ready', cancel: 'cancelled' },
  ready: { complete: 'completed' },
  completed: {},
  cancelled: {},
};

export function allowedActions(status: OrderStatus): OrderAction[] {
  return Object.keys(transitions[status]) as OrderAction[];
}

export function nextStatus(status: OrderStatus, action: OrderAction): OrderStatus {
  const next = transitions[status][action];
  if (!next) {
    const allowed = allowedActions(status);
    throw new ServiceError(409,
      `Cannot ${action} an order with status ${status}. Allowed actions: ${allowed.join(', ') || 'none (final status)'}.`,
      allowed);
  }
  return next;
}
