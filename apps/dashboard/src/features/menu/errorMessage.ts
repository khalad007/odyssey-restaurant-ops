export function errorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') return error.message;
  if (typeof error === 'string' && error.trim()) return error;
  return fallback;
}
