export class ServiceError extends Error {
  constructor(public readonly status: 400 | 404 | 409, message: string, public readonly allowedActions?: readonly string[]) {
    super(message);
  }
}

export function postgresErrorCode(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null) return undefined;
  if ('code' in error && typeof error.code === 'string') return error.code;
  return 'cause' in error ? postgresErrorCode(error.cause) : undefined;
}
