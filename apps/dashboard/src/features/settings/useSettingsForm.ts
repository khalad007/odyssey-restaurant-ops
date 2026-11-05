import { getGetSettingsQueryKey, updateSettingsBodySchema, useUpdateSettings, type Settings } from '@odyssey/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useToast } from '../../ui';

export function useSettingsForm(initial: Settings) {
  const [baseline, setBaseline] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [prep, setPrep] = useState(String(initial.prepTimeMinutes));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const mutation = useUpdateSettings();
  const client = useQueryClient();
  const { showToast } = useToast();
  const reset = () => { setDraft(baseline); setPrep(String(baseline.prepTimeMinutes)); setErrors({}); };
  const dirty = JSON.stringify(draft) !== JSON.stringify(baseline) || prep !== String(baseline.prepTimeMinutes);
  async function save() {
    if (mutation.isPending) return;
    const body = { acceptingOrders: draft.acceptingOrders, autoAcceptOrders: draft.autoAcceptOrders, openingHours: draft.openingHours };
    const result = updateSettingsBodySchema.safeParse({ ...body, prepTimeMinutes: prep.trim() ? Number(prep) : Number.NaN });
    if (!result.success) { setErrors(Object.fromEntries(result.error.issues.map((issue) => [issue.path.join('.'), issue.message]))); return; }
    setErrors({});
    try {
      const saved = await mutation.mutateAsync({ data: result.data });
      setBaseline(saved); setDraft(saved); setPrep(String(saved.prepTimeMinutes));
      client.setQueryData(getGetSettingsQueryKey(), saved);
      showToast({ tone: 'success', message: 'Settings saved.' });
    } catch (error) { const message = error && typeof error === 'object' && 'message' in error ? String(error.message) : 'Unable to save settings.'; setErrors({ form: message }); showToast({ tone: 'error', message }); }
  }
  return { draft, setDraft, prep, setPrep, errors, dirty, reset, save, pending: mutation.isPending };
}

