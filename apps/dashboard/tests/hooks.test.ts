import { act, renderHook } from '@testing-library/react-native';
import * as api from '@odyssey/api-client';
import { motion } from '@odyssey/shared';
import { useOrderFilters } from '../src/features/orders/useOrderFilters';
import { useOrders } from '../src/features/orders/useOrders';
import { useCreateOrderForm } from '../src/features/orders/useCreateOrderForm';
import { useOrderTransition } from '../src/features/orders/useOrderTransition';
import { useSettingsForm } from '../src/features/settings/useSettingsForm';

const mockCreate = jest.fn();
const mockTransition = jest.fn();
const mockUpdate = jest.fn();
const mockInvalidate = jest.fn().mockResolvedValue(undefined);
const mockSetData = jest.fn();
const mockToast = jest.fn();
jest.mock('../src/ui', () => ({ useToast: () => ({ showToast: mockToast }) }));
jest.mock('@tanstack/react-query', () => ({ ...jest.requireActual('@tanstack/react-query'), useQueryClient: () => ({ invalidateQueries: mockInvalidate, setQueryData: mockSetData }) }));
jest.mock('@odyssey/api-client', () => ({
  ...jest.requireActual('@odyssey/api-client'),
  useListCustomers: jest.fn(() => ({ data: [] })),
  useListMenuItems: jest.fn(),
  useListOrders: jest.fn(() => ({ data: undefined })),
  useCreateOrder: jest.fn(() => ({ mutateAsync: mockCreate, isPending: false })),
  useTransitionOrder: jest.fn(() => ({ mutate: mockTransition, isPending: false })),
  useUpdateSettings: jest.fn(() => ({ mutateAsync: mockUpdate, isPending: false })),
}));

const customerId = '11111111-1111-4111-8111-111111111111';
const item = { id: '22222222-2222-4222-8222-222222222222', categoryId: customerId, name: 'Soup', description: null, priceCents: 1299, isAvailable: true, createdAt: '2026-11-01T00:00:00Z', updatedAt: '2026-11-01T00:00:00Z' } satisfies api.MenuItem;
const settings = { id: 1, prepTimeMinutes: 20, acceptingOrders: true, autoAcceptOrders: false, openingHours: { monday: { open: '09:00', close: '17:00' }, tuesday: { open: '09:00', close: '17:00' }, wednesday: { open: '09:00', close: '17:00' }, thursday: { open: '09:00', close: '17:00' }, friday: { open: '09:00', close: '17:00' }, saturday: { open: '09:00', close: '17:00' }, sunday: { open: '09:00', close: '17:00' } } } satisfies api.Settings;

beforeEach(() => {
  jest.clearAllMocks();
  mockCreate.mockResolvedValue({});
  jest.mocked(api.useListMenuItems).mockReturnValue({ data: [item] } as ReturnType<typeof api.useListMenuItems>);
  mockUpdate.mockImplementation(({ data }) => Promise.resolve({ id: 1, ...data }));
});

test('order filters start empty, merge changes, and clear', async () => {
  const { result } = await renderHook(useOrderFilters);
  expect(result.current.filters).toEqual({});
  await act(() => result.current.set({ status: 'pending' }));
  await act(() => result.current.set({ orderType: 'pickup' }));
  expect(result.current.filters).toEqual({ status: 'pending', orderType: 'pickup' });
  await act(() => result.current.clear());
  expect(result.current.filters).toEqual({});
});

test('search waits for debounce, cancels stale input, resets page, and cleans up on unmount', async () => {
  jest.useFakeTimers();
  try {
    const { result, unmount } = await renderHook(useOrders);
    await act(() => result.current.setPage(3));
    await act(() => result.current.setSearch('old'));
    await act(() => jest.advanceTimersByTime(motion.durations.slow - 1));
    expect(jest.mocked(api.useListOrders).mock.lastCall?.[0]?.search).toBeUndefined();
    await act(() => result.current.setSearch('  soup  '));
    await act(() => jest.advanceTimersByTime(motion.durations.slow - 1));
    expect(jest.mocked(api.useListOrders).mock.lastCall?.[0]?.search).toBeUndefined();
    await act(() => jest.advanceTimersByTime(1));
    expect(jest.mocked(api.useListOrders).mock.lastCall?.[0]).toMatchObject({ search: 'soup', page: 1 });
    await act(() => result.current.setSearch('never sent'));
    await unmount();
    const calls = jest.mocked(api.useListOrders).mock.calls.length;
    await act(() => jest.runOnlyPendingTimers());
    expect(api.useListOrders).toHaveBeenCalledTimes(calls);
  } finally { jest.useRealTimers(); }
});

test('subtotal preview follows quantities and removals and excludes unavailable items', async () => {
  jest.mocked(api.useListMenuItems).mockReturnValue({ data: [item, { ...item, id: customerId, isAvailable: false }] } as ReturnType<typeof api.useListMenuItems>);
  const { result } = await renderHook(() => useCreateOrderForm(jest.fn()));
  expect(result.current.estimated).toBe(0);
  await act(() => result.current.add(customerId));
  expect(result.current.items).toEqual([]);
  await act(() => result.current.add(item.id));
  await act(() => result.current.quantity(item.id, 2));
  expect(result.current.estimated).toBe(3897);
  await act(() => result.current.remove(item.id));
  expect(result.current.estimated).toBe(0);
});

test('an empty cart fails validation without calling the mutation', async () => {
  const { result } = await renderHook(() => useCreateOrderForm(jest.fn()));
  await act(() => result.current.setCustomerId(customerId));
  await act(async () => { await result.current.submit(); });
  expect(result.current.error).toContain('items');
  expect(mockCreate).not.toHaveBeenCalled();
});

test('create sends only contract input fields, never prices, totals, snapshots or status', async () => {
  const close = jest.fn();
  const { result } = await renderHook(() => useCreateOrderForm(close));
  await act(() => { result.current.setCustomerId(customerId); result.current.setOrderType('delivery'); result.current.setNotes('  Ring bell  '); result.current.add(item.id); });
  await act(async () => { await result.current.submit(); });
  expect(mockCreate).toHaveBeenCalledWith({ data: { customerId, orderType: 'delivery', notes: 'Ring bell', items: [{ menuItemId: item.id, quantity: 1 }] } });
  expect(close).toHaveBeenCalledTimes(1);
});

test.each(['confirm', 'start_preparing', 'mark_ready', 'complete'] as const)('transition %s sends an action only', async (action) => {
  const { result } = await renderHook(useOrderTransition);
  await act(() => result.current.run(customerId, action));
  expect(mockTransition).toHaveBeenCalledWith({ id: customerId, data: { action } });
});

test('cancel sends only the action after confirmation', async () => {
  const { result } = await renderHook(useOrderTransition);
  await act(() => result.current.run(customerId, 'cancel'));
  expect(mockTransition).not.toHaveBeenCalled();
  await act(() => result.current.confirmCancel());
  expect(mockTransition).toHaveBeenCalledWith({ id: customerId, data: { action: 'cancel' } });
});

test('settings dirty state tracks changes, reset, and a successful save baseline', async () => {
  const { result } = await renderHook(() => useSettingsForm(settings));
  expect(result.current.dirty).toBe(false);
  await act(() => result.current.setDraft({ ...settings, acceptingOrders: false }));
  expect(result.current.dirty).toBe(true);
  await act(() => result.current.reset());
  expect(result.current.dirty).toBe(false);
  await act(() => result.current.setPrep('30'));
  expect(result.current.dirty).toBe(true);
  await act(async () => { await result.current.save(); });
  expect(result.current.dirty).toBe(false);
  expect(result.current.prep).toBe('30');
});

test.each(['-1', '241', '1.5', '', 'abc'])('invalid prep time %s gives a field error and does not save', async (value) => {
  const { result } = await renderHook(() => useSettingsForm(settings));
  await act(() => result.current.setPrep(value));
  await act(async () => { await result.current.save(); });
  expect(result.current.errors.prepTimeMinutes).toBeTruthy();
  expect(mockUpdate).not.toHaveBeenCalled();
});

test.each(['0', '240'])('prep time boundary %s is accepted', async (value) => {
  const { result } = await renderHook(() => useSettingsForm(settings));
  await act(() => result.current.setPrep(value));
  await act(async () => { await result.current.save(); });
  expect(mockUpdate).toHaveBeenCalledWith({ data: { prepTimeMinutes: Number(value), acceptingOrders: true, autoAcceptOrders: false, openingHours: settings.openingHours } });
  expect(result.current.errors).toEqual({});
});

