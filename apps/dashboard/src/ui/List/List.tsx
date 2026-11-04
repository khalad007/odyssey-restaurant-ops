import { borderWidths, colors, radii } from '@odyssey/shared';
import { View, type ViewProps } from 'react-native';
import { ListItem } from '../ListItem';

function ListRoot({ style, ...props }: ViewProps) {
  return <View {...props} role="list" style={[{ borderWidth: borderWidths.thin, borderColor: colors.border, borderRadius: radii.md, backgroundColor: colors.surface }, style]} />;
}
export const List = Object.assign(ListRoot, { Item: ListItem });
