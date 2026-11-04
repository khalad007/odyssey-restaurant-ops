import { PageHeader } from '../../ui';
import { Controls } from './Controls';
import { Foundations } from './Foundations';
import { Patterns } from './Patterns';
import { SectionNav } from './SectionNav';

export function UiLibraryScreen() {
  return <>
    <PageHeader title="UI Library" subtitle="The living reference for Odyssey’s tokens, components, and interaction patterns." />
    <SectionNav />
    <Foundations />
    <Controls />
    <Patterns />
  </>;
}
