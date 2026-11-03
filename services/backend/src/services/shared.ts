import type { createDatabase } from '../db/client';
import { ServiceError } from './errors';
import { allowedActions, type OrderStatus } from './orderStateMachine';

export type Database = Omit<ReturnType<typeof createDatabase>['db'], '$client'>;

export function serializeTimestamps<T extends { createdAt: Date; updatedAt: Date }>(row: T) {
  const { createdAt, updatedAt, ...data } = row;
  return { ...data, createdAt: createdAt.toISOString(), updatedAt: updatedAt.toISOString() };
}

export function requireRow<T>(row: T | undefined, label: string): T {
  if (!row) throw new ServiceError(404, `${label} not found.`);
  return row;
}

export function serializeOrder<T extends { createdAt: Date; updatedAt: Date; status: OrderStatus }>(row: T) {
  return { ...serializeTimestamps(row), allowedActions: allowedActions(row.status) };
}
