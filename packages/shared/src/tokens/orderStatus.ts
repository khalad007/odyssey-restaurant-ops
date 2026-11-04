import type { OrderStatus } from '@odyssey/api-client';
import { semanticColorVariants } from './colors';

// Exhaustiveness is checked against the generated Drizzle/OpenAPI status union.
export const orderStatusColors = {
  pending: semanticColorVariants.warning,
  confirmed: semanticColorVariants.info,
  preparing: semanticColorVariants.primary,
  ready: semanticColorVariants.success,
  completed: semanticColorVariants.success,
  cancelled: semanticColorVariants.danger,
} as const satisfies Record<OrderStatus, (typeof semanticColorVariants)[keyof typeof semanticColorVariants]>;
