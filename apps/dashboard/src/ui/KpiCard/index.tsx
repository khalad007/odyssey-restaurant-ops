import { dashboard } from '@odyssey/shared';
import { Card } from '../Card';
import { Text } from '../Text';

export function KpiCard({ label, value }: { label: string; value: string }) {
  return <Card variant="outlined" style={{ flexGrow: 1, flexBasis: dashboard.kpiWidth }}><Card.Body><Text color="textSecondary" variant="label">{label}</Text><Text variant="h2">{value}</Text></Card.Body></Card>;
}
