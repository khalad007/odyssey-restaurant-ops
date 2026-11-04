import { borders, borderWidths, brand, colors, layout, library, motion, neutral, radii, semanticColorVariants, shadowColors, shadows, spacing, typography } from '@odyssey/shared';
import { Platform, View } from 'react-native';
import { Row, Stack, Text } from '../../ui';
import { Grid, Section, Tile } from './Section';

function Swatches({ values }: { values: Record<string, string> }) {
  return <Grid>{Object.entries(values).map(([name, value]) => <Tile key={name} title={name}>
    <View accessibilityLabel={`${name}: ${value}`} style={{ height: library.swatchHeight, backgroundColor: value, borderWidth: borderWidths.thin, borderColor: colors.border, borderRadius: radii.md }} />
    <Text variant="mono" selectable>{value}</Text>
  </Tile>)}</Grid>;
}
export function Foundations() {
  return <>
    <Section id="colors" title="Colors">
      <Text variant="h3">Primitive · neutral</Text><Swatches values={Object.fromEntries(Object.entries(neutral).map(([key, value]) => [`neutral.${key}`, value]))} />
      <Text variant="h3">Primitive · brand</Text><Swatches values={Object.fromEntries(Object.entries(brand).map(([key, value]) => [`brand.${key}`, value]))} />
      <Text variant="h3">Semantic · roles</Text><Swatches values={Object.fromEntries(Object.entries(colors).flatMap(([name, value]) => typeof value === 'string' ? [[name, value]] : []))} />
      <Text variant="h3">Semantic · role variants</Text><Swatches values={Object.fromEntries(Object.entries(semanticColorVariants).flatMap(([role, variants]) => Object.entries(variants).map(([name, value]) => [`${role}.${name}`, value])))} />
      <Text variant="h3">Shadow colors</Text><Swatches values={shadowColors} />
    </Section>
    <Section id="typography" title="Typography">
      {Object.entries(typography.variants).map(([name, style]) => <Stack key={name}>
        <Text variant="mono">{name} · {style.fontSize}px / {style.lineHeight}px · {style.fontWeight}</Text>
        <Text variant={name as keyof typeof typography.variants}>The quick brown fox — Odyssey</Text>
      </Stack>)}
      <Grid>{Object.entries({ fontFamilies: typography.fontFamilies, fontSizes: typography.fontSizes, fontWeights: typography.fontWeights, lineHeights: typography.lineHeights }).map(([name, values]) => <Tile key={name} title={name}>{Object.entries(values).map(([key, value]) => <Text key={key} variant="mono">{key}: {value}</Text>)}</Tile>)}</Grid>
    </Section>
    <Section id="spacing" title="Spacing">
      {Object.entries(spacing).map(([name, value]) => <Row key={name}><Text variant="mono">spacing.{name} · {value}px</Text><View style={{ width: value, height: spacing[4], backgroundColor: colors.primary, borderRadius: radii.xs }} /></Row>)}
    </Section>
    <Section id="radius" title="Radius"><Grid>{Object.entries(radii).map(([name, value]) => <Tile key={name} title={`${name} · ${value}px`}><View style={{ height: library.sampleHeight, backgroundColor: colors.primarySubtle, borderWidth: borderWidths.medium, borderColor: colors.primary, borderRadius: value }} /></Tile>)}</Grid></Section>
    <Section id="borders-shadows" title="Borders & shadows / elevation">
      <Grid>{Object.entries(borderWidths).map(([name, width]) => <Tile key={name} title={`${name} · ${width}px`}><View style={{ height: library.sampleHeight, borderWidth: width, borderColor: colors.textSecondary, borderRadius: radii.md }} /></Tile>)}</Grid>
      <Grid>{Object.entries({ default: borders.default, strong: borders.strong, focus: borders.focus }).map(([name, style]) => <Tile key={name} title={`borders.${name}`}><View style={[{ height: library.sampleHeight, borderRadius: radii.md }, style]} /><Text variant="mono">{JSON.stringify(style)}</Text></Tile>)}</Grid>
      <Grid>{Object.entries(shadows).map(([level, shadow]) => <Tile key={level} title={`Elevation ${level}`}><View style={[{ height: library.sampleHeight, backgroundColor: colors.surfaceRaised, borderRadius: radii.md }, Platform.OS === 'web' ? shadow.web : shadow.native]} /><Text variant="mono">Web: {shadow.web.boxShadow}</Text><Text variant="mono">Native: {JSON.stringify(shadow.native)}</Text></Tile>)}</Grid>
    </Section>
    <Section id="layout" title="Layout & grid rules">
      <Grid><Tile title="Breakpoints">{Object.entries(layout.breakpoints).map(([name, value]) => <Text key={name} variant="mono">{name}: {value}px</Text>)}</Tile>
        <Tile title="Shell & page">{Object.entries(layout.sidebar).map(([name, value]) => <Text key={name} variant="mono">sidebar.{name}: {value}px</Text>)}{Object.entries(layout.page).map(([name, value]) => <Text key={name} variant="mono">page.{name}: {value}px</Text>)}</Tile>
        <Tile title="Motion durations">{Object.entries(motion.durations).map(([name, value]) => <Text key={name} variant="mono">{name}: {value}ms</Text>)}</Tile></Grid>
      {Object.entries(layout.grid.columns).map(([name, columns]) => <Stack key={name}><Text variant="label">{name}: {columns} columns · gutter {layout.grid.gutters[name as keyof typeof layout.grid.gutters]}px</Text><View style={{ flexDirection: 'row', gap: layout.grid.gutters[name as keyof typeof layout.grid.gutters] }}>{Array.from({ length: columns }, (_, index) => <View key={index} style={{ flex: 1, minWidth: spacing[0], height: library.gridCellHeight, backgroundColor: colors.primarySubtle, borderRadius: radii.xs }} />)}</View></Stack>)}
    </Section>
  </>;
}

