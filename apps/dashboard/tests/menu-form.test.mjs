import assert from 'node:assert/strict';
import { test } from 'node:test';
import { priceInputToCents } from '../src/features/menu/priceInputToCents.ts';
import { CreateMenuItemBody, UpdateMenuItemBody } from '../../../packages/api-client/src/generated-validation/menu.ts';

const valid = { categoryId: '11111111-1111-4111-8111-111111111111', name: 'Soup', priceCents: 0, description: null, isAvailable: false };

test('decimal input converts exactly to integer cents, including the database limit', () => {
  for (const [input, expected] of [['0', 0], ['0.01', 1], ['1.10', 110], ['0.29', 29], ['12.5', 1250], [' 12.50 ', 1250], ['21474836.47', 2147483647]]) {
    assert.equal(priceInputToCents(input), expected);
  }
});

test('invalid price syntax is rejected rather than rounded or treated as free', () => {
  for (const input of ['', ' ', '-1', '1.001', '1e3', 'Infinity', '1,200', 'free']) assert(Number.isNaN(priceInputToCents(input)), input);
});

test('generated menu contracts accept free unavailable items and reject invalid fields', () => {
  assert(CreateMenuItemBody.safeParse(valid).success);
  assert(UpdateMenuItemBody.safeParse(valid).success);
  for (const change of [{ name: '' }, { categoryId: '' }, { priceCents: -1 }, { priceCents: 1.2 }, { priceCents: 2147483648 }, { status: 'pending' }]) {
    assert.equal(CreateMenuItemBody.safeParse({ ...valid, ...change }).success, false);
  }
});
