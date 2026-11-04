import { createMenuItemBodySchema, updateMenuItemBodySchema, type CreateMenuItemBody, type MenuItem } from '@odyssey/api-client';
import { useState } from 'react';
import { priceInputToCents } from './priceInputToCents';

export function useMenuItemForm(item: MenuItem | undefined, onSave: (data: CreateMenuItemBody) => Promise<void>) {
  const [name, setName] = useState(item?.name ?? '');
  const [categoryId, setCategoryId] = useState(item?.categoryId ?? '');
  const [description, setDescription] = useState(item?.description ?? '');
  const [price, setPrice] = useState(item ? (item.priceCents / 100).toFixed(2) : '');
  const [isAvailable, setIsAvailable] = useState(item?.isAvailable ?? true);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateMenuItemBody, string>>>({});

  async function submit() {
    // Convert decimal display input exactly; never round a floating-point price.
    const priceCents = priceInputToCents(price);
    const data = { name: name.trim(), categoryId, description: description.trim() || null, priceCents, isAvailable } satisfies CreateMenuItemBody;
    const result = createMenuItemBodySchema.safeParse(data);
    const nextErrors: typeof errors = {};
    if (!result.success) for (const issue of result.error.issues) {
      const field = issue.path[0];
      if (typeof field === 'string' && field in data) nextErrors[field as keyof CreateMenuItemBody] = issue.message;
    }
    if (Number.isNaN(priceCents)) nextErrors.priceCents = 'Enter a price with up to two decimal places, for example 12.50.';
    setErrors(nextErrors);
    if (!result.success || Object.keys(nextErrors).length) return;
    // Both operations use validators generated from their respective contracts.
    if (item && !updateMenuItemBodySchema.safeParse(result.data).success) return;
    await onSave(result.data);
  }
  return { name, setName, categoryId, setCategoryId, description, setDescription, price, setPrice, isAvailable, setIsAvailable, errors, submit };
}
