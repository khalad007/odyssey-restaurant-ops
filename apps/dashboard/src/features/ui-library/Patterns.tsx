import { feedback, formatCurrencyFromCents } from '@odyssey/shared';
import { useState } from 'react';
import { Alert, Badge, Banner, Button, Card, Drawer, EmptyState, ErrorState, Input, List, Modal, Pagination, Row, Skeleton, Spinner, Stack, Surface, Table, Tabs, Text, useToast, type TableSort } from '../../ui';
import { Grid, Section, Tile } from './Section';

// Presentation fixtures, independent of API data.
const samples = [{ id: 'soup', name: 'Seasonal soup', category: 'Starters', cents: 850 }, { id: 'pasta', name: 'Garden pasta', category: 'Mains', cents: 1650 }, { id: 'tart', name: 'Lemon tart', category: 'Desserts', cents: 700 }];

export function Patterns() {
  const [sort, setSort] = useState<TableSort>({ key: 'name', direction: 'asc' });
  const [tab, setTab] = useState('overview');
  const [page, setPage] = useState(1);
  const [overlay, setOverlay] = useState<'modal' | 'drawer'>();
  const [retrying, setRetrying] = useState(false);
  const [saved, setSaved] = useState(false);
  const { showToast } = useToast();
  const rows = [...samples].sort((a, b) => (sort.key === 'price' ? a.cents - b.cents : a.name.localeCompare(b.name)) * (sort.direction === 'asc' ? 1 : -1));
  const save = () => { setOverlay(undefined); showToast({ tone: 'success', message: 'Demo saved. No server data was changed.' }); };
  return <>
    <Section id="surfaces" title="Surfaces & cards"><Grid>{(['flat', 'raised', 'outlined'] as const).map((variant) => <Tile key={variant} title={variant}><Card variant={variant}><Card.Header>Service overview</Card.Header><Card.Body><Text>Composed with Card.Header and Card.Body.</Text><Badge tone="success" variant="dot">Accepting orders</Badge></Card.Body></Card><Surface variant={variant}><Card.Body>Surface uses the same recipe.</Card.Body></Surface></Tile>)}</Grid></Section>
    <Section id="data" title="Table & list"><Text color="textSecondary">Sort headers reorder local fixtures. Below the tablet breakpoint, rows become stacked cards.</Text>
      <Table label="Example menu" rows={rows} rowKey={(row) => row.id} sort={sort} onSort={setSort} columns={[
        { key: 'name', header: 'Name', sortable: true, cell: (row) => row.name },
        { key: 'category', header: 'Category', cell: (row) => row.category },
        { key: 'price', header: 'Price', sortable: true, cell: (row) => formatCurrencyFromCents(row.cents) },
      ]} />
      <List accessibilityLabel="Example checklist"><List.Item title="Open the kitchen" description="Interactive list item" left={<Badge tone="success" variant="dot">Ready</Badge>} onPress={() => showToast({ tone: 'info', message: 'Checklist item selected.' })} /><List.Item title="Review the menu" description="Static list item" right={<Text variant="caption">Today</Text>} /><List.Item title="Close service" description="Disabled action" disabled onPress={() => {}} /></List>
    </Section>
    <Section id="navigation" title="Navigation"><Tabs label="Example views" value={tab} onValueChange={setTab} items={[
      { value: 'overview', label: 'Overview', content: <Text>Overview panel. Use arrow keys to change tabs.</Text> },
      { value: 'activity', label: 'Activity', content: <Text>Activity panel.</Text> },
      { value: 'archived', label: 'Archived', disabled: true, content: <Text>Archived panel.</Text> },
    ]} /><Pagination page={page} totalPages={12} onPageChange={setPage} /><Text variant="caption">Current demo page: {page}</Text><Pagination page={1} totalPages={1} onPageChange={() => {}} disabled /></Section>
    <Section id="overlays" title="Modal & drawer"><Row style={{ flexWrap: 'wrap' }}><Button onPress={() => setOverlay('modal')}>Open modal demo</Button><Button variant="secondary" onPress={() => setOverlay('drawer')}>Open drawer demo</Button></Row><Text color="textSecondary">Try Escape, backdrop click, Tab / Shift+Tab, and focus restoration. The drawer fills narrow screens.</Text>
      <Modal title="Modal demo" open={overlay === 'modal'} onClose={() => setOverlay(undefined)} footer={<Row justify="flex-end"><Button variant="secondary" onPress={() => setOverlay(undefined)}>Cancel</Button><Button onPress={save}>Save demo</Button></Row>}><Stack><Text>A focused dialog for a short task.</Text><Input label="Modal demo name" placeholder="Enter a name" /></Stack></Modal>
      <Drawer title="Drawer demo" open={overlay === 'drawer'} onClose={() => setOverlay(undefined)} footer={<Row justify="flex-end"><Button variant="secondary" onPress={() => setOverlay(undefined)}>Cancel</Button><Button onPress={save}>Save demo</Button></Row>}><Stack><Text>A side panel for create and edit forms.</Text><Input label="Drawer demo name" placeholder="Enter a name" /><Input label="Drawer demo notes" placeholder="Optional notes" /></Stack></Drawer>
    </Section>
    <Section id="feedback" title="Feedback"><Row style={{ flexWrap: 'wrap' }}>{(['success', 'warning', 'error', 'info'] as const).map((tone) => <Button key={tone} variant="secondary" onPress={() => showToast({ tone, title: `${tone} notification`, message: 'This is a local demo notification.', action: { label: 'Undo', onPress: () => showToast({ tone: 'info', message: 'Demo action undone.' }) } })}>{`Show ${tone} toast`}</Button>)}</Row>
      <Grid>{Object.keys(feedback.tones).map((tone) => <Tile key={tone} title={tone}><Alert tone={tone as keyof typeof feedback.tones} title="Inline alert" message="A clear message with an optional action." action={{ label: 'Try action', onPress: () => showToast({ tone: 'info', message: 'Alert action selected.' }) }} /><Banner tone={tone as keyof typeof feedback.tones} message="Banner using the same semantic treatment." /></Tile>)}</Grid>
    </Section>
    <Section id="states" title="State patterns"><Grid>
      <Tile title="Loading"><Row><Spinner size="sm" /><Spinner size="md" /><Spinner size="lg" /></Row><Row><Skeleton variant="circle" /><Stack style={{ flex: 1 }}><Skeleton variant="text" /><Skeleton variant="text" /></Stack></Row><Skeleton variant="block" /></Tile>
      <Tile title="Empty"><EmptyState icon="restaurant-outline" title="No menu items" description="Create your first item to get started." action={{ label: 'Create demo item', onPress: () => setOverlay('drawer') }} /></Tile>
      <Tile title="Error"><ErrorState message="We could not load this demo." retrying={retrying} onRetry={() => { setRetrying(true); showToast({ tone: 'info', message: 'Retry demo started.' }); }} />{retrying ? <Button variant="ghost" onPress={() => setRetrying(false)}>Reset retry demo</Button> : null}</Tile>
      <Tile title="Success"><Alert tone="success" title="Changes saved" message={saved ? 'You acknowledged this demo.' : 'Your menu is ready for service.'} action={{ label: 'Acknowledge', onPress: () => setSaved(true) }} /></Tile>
      <Tile title="Warning"><Alert tone="warning" title="Service paused" message="Review availability before accepting new orders." /><Badge tone="warning" variant="dot">Needs attention</Badge></Tile>
    </Grid></Section>
  </>;
}
