import type { EmptyStateProps } from '../EmptyState';
import { EmptyState } from '../EmptyState';
import { PageHeader, type PageHeaderProps } from './PageHeader';

export type PlaceholderPageProps = Pick<PageHeaderProps, 'title' | 'subtitle'> & {
  icon: EmptyStateProps['icon']; emptyTitle: string; description: string;
};
export function PlaceholderPage({ title, subtitle, icon, emptyTitle, description }: PlaceholderPageProps) {
  return <><PageHeader title={title} subtitle={subtitle} /><EmptyState icon={icon} title={emptyTitle} description={description} /></>;
}
