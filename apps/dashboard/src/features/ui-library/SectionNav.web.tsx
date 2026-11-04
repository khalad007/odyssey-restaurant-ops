import { borderWidths, colors, fontFamilies, layout, library, radii, spacing, textVariants } from '@odyssey/shared';
import { useEffect, useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { sections } from './reference';

export function SectionNav() {
  const { width } = useWindowDimensions();
  const navigation = useRef<HTMLElement>(null);
  const [active, setActive] = useState<string>(sections[0].id);
  useEffect(() => {
    const update = () => {
      const threshold = (navigation.current?.getBoundingClientRect().bottom ?? spacing[0]) + spacing[6];
      const current = sections.filter(({ id }) => { const element = document.getElementById(id); return element && element.getBoundingClientRect().top <= threshold; }).at(-1);
      setActive(current?.id ?? sections[0].id);
    };
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    update();
    return () => { window.removeEventListener('scroll', update, true); window.removeEventListener('resize', update); };
  }, []);
  return <nav ref={navigation} aria-label="UI library sections" style={{ position: 'sticky', top: library.navOffset, zIndex: library.navZIndex, background: colors.surface, padding: spacing[3], border: `${borderWidths.thin}px solid ${colors.border}`, borderRadius: radii.lg, display: 'flex', flexWrap: width < layout.breakpoints.md ? 'nowrap' : 'wrap', overflowX: 'auto', gap: spacing[1] }}>
    {sections.map(({ id, title }) => <a key={id} href={`#${id}`} aria-current={active === id ? 'location' : undefined}
      onClick={(event) => { event.preventDefault(); setActive(id); const target = document.getElementById(id); if (target) { target.style.scrollMarginTop = `${(navigation.current?.getBoundingClientRect().height ?? spacing[0]) + spacing[4]}px`; target.scrollIntoView({ block: 'start' }); } }}
      style={{ ...textVariants.bodySmall, lineHeight: `${textVariants.bodySmall.lineHeight}px`, flexShrink: 0, fontFamily: fontFamilies.webSans, color: active === id ? colors.primary : colors.textSecondary, background: active === id ? colors.primarySubtle : colors.transparent, padding: spacing[2], borderRadius: radii.sm, textDecoration: 'none' }}>{title}</a>)}
  </nav>;
}
