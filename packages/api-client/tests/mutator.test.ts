import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { apiFetch, setApiBaseUrl } from '../src/mutator';
import { listOrders, transitionOrder } from '../src/index';

afterEach(() => setApiBaseUrl(''));

test('uses the configured base URL, preserves the query, and parses JSON', async (t) => {
  const fetch = t.mock.method(globalThis, 'fetch', async () => Response.json({ value: 7 }));
  setApiBaseUrl('http://localhost:8787///');
  assert.deepEqual(await apiFetch('/orders?page=2'), { value: 7 });
  assert.equal(fetch.mock.calls[0].arguments[0], 'http://localhost:8787/orders?page=2');
  setApiBaseUrl('https://api.example.com');
  await apiFetch('/settings');
  assert.equal(fetch.mock.calls[1].arguments[0], 'https://api.example.com/settings');
});

test('preserves request options including body and abort signal', async (t) => {
  const fetch = t.mock.method(globalThis, 'fetch', async () => Response.json({ ok: true }));
  const options = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}', signal: new AbortController().signal };
  await apiFetch('/orders', options);
  assert.equal(fetch.mock.calls[0].arguments[0], '/orders');
  assert.equal(fetch.mock.calls[0].arguments[1], options);
});

test('throws the parsed error body for non-2xx responses', async (t) => {
  const error = { message: 'Cannot complete a pending order.', allowedActions: ['confirm', 'cancel'] };
  t.mock.method(globalThis, 'fetch', async () => Response.json(error, { status: 409 }));
  await assert.rejects(apiFetch('/orders/id/transition'), (body) => {
    assert.deepEqual(body, error);
    return true;
  });
});

test('handles a successful empty response', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response(null, { status: 204 }));
  assert.equal(await apiFetch('/health'), undefined);
});

test('preserves a non-JSON error response', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response('Bad gateway', { status: 502 }));
  await assert.rejects(apiFetch('/health'), (body) => body === 'Bad gateway');
});

test('propagates network errors', async (t) => {
  const error = new TypeError('Failed to fetch');
  t.mock.method(globalThis, 'fetch', async () => { throw error; });
  await assert.rejects(apiFetch('/health'), (body) => body === error);
});

test('generated clients use the mutator and return parsed response bodies', async (t) => {
  const body = { data: [], page: 2, pageSize: 5, total: 0, totalPages: 0 };
  const fetch = t.mock.method(globalThis, 'fetch', async () => Response.json(body));
  setApiBaseUrl('http://localhost:8787');
  assert.deepEqual(await listOrders({ page: 2, pageSize: 5 }), body);
  assert.equal(fetch.mock.calls[0].arguments[0], 'http://localhost:8787/orders?page=2&pageSize=5');
});

test('generated mutations serialize the action and throw the server error body', async (t) => {
  const body = { message: 'Invalid transition.', allowedActions: ['confirm', 'cancel'] };
  const fetch = t.mock.method(globalThis, 'fetch', async () => Response.json(body, { status: 409 }));
  setApiBaseUrl('http://localhost:8787');
  await assert.rejects(transitionOrder('order-id', { action: 'complete' }), (error) => {
    assert.deepEqual(error, body);
    return true;
  });
  assert.equal(fetch.mock.calls[0].arguments[0], 'http://localhost:8787/orders/order-id/transition');
  const options = fetch.mock.calls[0].arguments[1];
  assert.equal(options?.method, 'POST');
  assert.equal(options?.body, JSON.stringify({ action: 'complete' }));
});
