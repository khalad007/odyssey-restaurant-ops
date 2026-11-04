import { Ionicons } from '@expo/vector-icons';
import { colors, controls, orderStatusColors, spacing } from '@odyssey/shared';
import { useState } from 'react';
import { View } from 'react-native';
import { Alert, Badge, Button, Checkbox, IconButton, Input, Row, Select, Stack, Switch, Text, Textarea } from '../../ui';
import { InteractionPreview } from '../../ui/_internal/InteractionPreview';
import { Grid, Section, Tile } from './Section';

const buttonStates = ['default', 'hover', 'pressed', 'focus', 'disabled', 'loading'] as const;
const formStates = ['default', 'focus', 'error', 'disabled'] as const;
const options = [{ value: 'all', label: 'All categories' }, { value: 'mains', label: 'Mains' }, { value: 'desserts', label: 'Desserts' }, { value: 'archived', label: 'Archived', disabled: true }];

function FormExample({ state }: { state: typeof formStates[number] }) {
  const [selection, setSelection] = useState('all');
  const [checked, setChecked] = useState(false);
  const [available, setAvailable] = useState(true);
  const error = state === 'error' ? 'Please check this value.' : undefined;
  const disabled = state === 'disabled';
  return <Tile title={state}><InteractionPreview.Provider value={state === 'focus' ? 'focus' : 'default'}>
    <Input label={`Name · ${state}`} placeholder="Menu item name" error={error} disabled={disabled} helperText="A clear, short label." leftAdornment={<Ionicons name="search" size={controls.button.sizes.sm.icon} color={colors.textMuted} />} rightAdornment={<Text variant="caption">Optional</Text>} />
    <Textarea label={`Description · ${state}`} placeholder="Add a description" error={error} disabled={disabled} />
    <Select label={`Category · ${state}`} value={selection} onValueChange={setSelection} options={options} error={error} disabled={disabled} />
    <Switch label={`Available · ${state}`} value={available} onValueChange={setAvailable} disabled={disabled} aria-invalid={Boolean(error)} accessibilityHint={error} />
    <Checkbox label={`Featured · ${state}`} checked={checked} onCheckedChange={setChecked} disabled={disabled} aria-invalid={Boolean(error)} accessibilityHint={error} />
    {error ? <Alert tone="danger" message="Choose an availability and featured preference before continuing. Toggle controls use a group error message." /> : null}
  </InteractionPreview.Provider></Tile>;
}
export function Controls() {
  return <>
    <Section id="buttons" title="Buttons">
      <Text color="textSecondary">Each variant × size × state uses the real Button. Hover, pressed and focus snapshots share its interaction styles; controls remain interactive.</Text>
      {Object.keys(controls.button.variants).map((variant) => <Stack key={variant}><Text variant="h3">{variant}</Text><Grid>{Object.keys(controls.button.sizes).map((size) => <Tile key={size} title={size}>{buttonStates.map((state) => <Stack key={state} gap={2}><Text variant="caption">{state}</Text><InteractionPreview.Provider value={state === 'disabled' || state === 'loading' ? 'default' : state}><Button variant={variant as keyof typeof controls.button.variants} size={size as keyof typeof controls.button.sizes} disabled={state === 'disabled'} loading={state === 'loading'} accessibilityLabel={`${variant} ${size} ${state}`}>Save changes</Button></InteractionPreview.Provider></Stack>)}</Tile>)}</Grid></Stack>)}
      <Row style={{ flexWrap: 'wrap' }}><Button leftIcon="add">Create item</Button><IconButton icon="settings-outline" accessibilityLabel="Example settings" /><IconButton icon="trash-outline" variant="danger" accessibilityLabel="Example delete" /></Row>
    </Section>
    <Section id="forms" title="Form controls"><Text color="textSecondary">Editable examples. Focus snapshots display the shared focus ring; keyboard Tab also reveals real focus states.</Text><Grid>{formStates.map((state) => <FormExample key={state} state={state} />)}</Grid></Section>
    <Section id="badges" title="Badges & status indicators"><Grid>{Object.keys(controls.tones).map((tone) => <Tile key={tone} title={tone}><Row style={{ flexWrap: 'wrap' }}><Badge tone={tone as keyof typeof controls.tones}>{tone}</Badge><Badge tone={tone as keyof typeof controls.tones} variant="dot">With dot</Badge></Row></Tile>)}</Grid>
      <Text variant="h3">Order statuses</Text><Grid>{Object.entries(orderStatusColors).map(([status, palette]) => <Tile key={status} title={status}><View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2], backgroundColor: palette.subtle, padding: spacing[2] }}><View style={{ width: controls.badge.dot, height: controls.badge.dot, borderRadius: controls.badge.dot, backgroundColor: palette.color }} /><Text style={{ color: palette.text }}>{status.replaceAll('_', ' ')}</Text></View><Text variant="mono">{palette.color} · {palette.subtle} · {palette.text}</Text></Tile>)}</Grid>
    </Section>
  </>;
}
