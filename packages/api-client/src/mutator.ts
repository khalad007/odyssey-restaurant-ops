let apiBaseUrl = '';

export function setApiBaseUrl(baseUrl: string): void {
  apiBaseUrl = baseUrl.replace(/\/+$/, '');
}

// Transport adapter: error shapes are supplied by the generated contract.
export type ErrorType<T> = T;

export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`, options);
  const text = await response.text();
  let body: unknown = text || undefined;
  if (text) {
    try { body = JSON.parse(text); }
    catch { /* Preserve non-JSON error responses, such as gateway errors. */ }
  }
  if (!response.ok) throw body;
  return body as T;
}
