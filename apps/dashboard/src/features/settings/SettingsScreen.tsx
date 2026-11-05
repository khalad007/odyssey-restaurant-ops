import type { Settings } from '@odyssey/api-client';
import { Alert, Button, Card, ErrorState, Input, PageHeader, Row, Skeleton, Stack, Switch, Text } from '../../ui';
import { SaveBar } from './SaveBar';
import { useSettings } from './useSettings';
import { useSettingsForm } from './useSettingsForm';

function SettingsForm({ initial }: { initial: Settings }) {
  const form = useSettingsForm(initial);
  return <>
    {form.errors.form ? <Alert tone="danger" message={form.errors.form} /> : null}
    <Card variant="outlined"><Card.Header>Ordering</Card.Header><Card.Body>
      <Switch label="Accepting orders" value={form.draft.acceptingOrders} disabled={form.pending} onValueChange={(acceptingOrders) => form.setDraft({ ...form.draft, acceptingOrders })} />
      <Switch label="Auto-accept orders" value={form.draft.autoAcceptOrders} disabled={form.pending} onValueChange={(autoAcceptOrders) => form.setDraft({ ...form.draft, autoAcceptOrders })} />
      <Input label="Preparation time (minutes)" value={form.prep} onChangeText={form.setPrep} disabled={form.pending} inputMode="numeric" helperText="Between 0 and 240 minutes." error={form.errors.prepTimeMinutes} />
    </Card.Body></Card>
    <Card variant="outlined"><Card.Header>Opening hours</Card.Header><Card.Body><Stack gap={5}>{Object.entries(form.draft.openingHours).map(([name, hours]) => {
      const day = name as keyof Settings['openingHours'];
      const change = (value: Partial<typeof hours>) => form.setDraft({ ...form.draft, openingHours: { ...form.draft.openingHours, [day]: { ...hours, ...value } } });
      return <Stack key={day}><Text variant="h3">{day}</Text><Switch label={`${day} closed`} value={hours.closed ?? false} disabled={form.pending} onValueChange={(closed) => change({ closed })} /><Row style={{ flexWrap: 'wrap' }}><Input label={`${day} open`} value={hours.open} onChangeText={(open) => change({ open })} disabled={form.pending || hours.closed} placeholder="HH:mm" error={form.errors[`openingHours.${day}.open`]} /><Input label={`${day} close`} value={hours.close} onChangeText={(close) => change({ close })} disabled={form.pending || hours.closed} placeholder="HH:mm" error={form.errors[`openingHours.${day}.close`]} /></Row></Stack>;
    })}</Stack></Card.Body></Card>
    {form.dirty ? <SaveBar><Row justify="space-between"><Text>Unsaved changes</Text><Row><Button variant="secondary" disabled={form.pending} onPress={form.reset}>Reset</Button><Button loading={form.pending} onPress={() => void form.save()}>Save</Button></Row></Row></SaveBar> : null}
  </>;
}
export function SettingsScreen() {
  const settings = useSettings();
  return <><PageHeader title="Settings" subtitle="Ordering preferences and opening hours." />{settings.isPending ? <Stack><Skeleton variant="block" /><Skeleton variant="block" /></Stack> : settings.isError ? <ErrorState message={settings.error.message ?? 'Unable to load settings.'} onRetry={() => void settings.refetch()} retrying={settings.isFetching} /> : settings.data ? <SettingsForm initial={settings.data} /> : null}</>;
}
