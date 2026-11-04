import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatCurrencyFromCents } from '../src/formatCurrencyFromCents';

test('formats integer cents with USD defaults', () => {
  assert.equal(formatCurrencyFromCents(0), '$0.00');
  assert.equal(formatCurrencyFromCents(1), '$0.01');
  assert.equal(formatCurrencyFromCents(123456), '$1,234.56');
  assert.equal(formatCurrencyFromCents(-499), '-$4.99');
  assert.equal(formatCurrencyFromCents(-1), '-$0.01');
});
test('supports a different currency and locale', () => {
  assert.equal(formatCurrencyFromCents(123456, 'EUR', 'de-DE'), '1.234,56\u00a0€');
  assert.equal(formatCurrencyFromCents(123456, 'BDT', 'en-US'), 'BDT\u00a01,234.56');
});
test('handles the largest database integer amount', () => {
  assert.equal(formatCurrencyFromCents(2147483647), '$21,474,836.47');
});
test('keeps cents exact at the safe-integer boundary', () => {
  assert.equal(formatCurrencyFromCents(Number.MAX_SAFE_INTEGER), '$90,071,992,547,409.91');
  assert.equal(formatCurrencyFromCents(-Number.MAX_SAFE_INTEGER), '-$90,071,992,547,409.91');
});
test('rejects fractional, non-finite, and unsafe cent amounts', () => {
  for (const value of [1.5, Number.NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => formatCurrencyFromCents(value), RangeError);
  }
});
