import { ActivityIndicator, Button, ScrollView, Switch, Text, View } from 'react-native';
import { useMenuItems } from './useMenuItems';

export function MenuScreen() {
  const menu = useMenuItems();

  return (
    <ScrollView>
      <Text accessibilityRole="header">Menu</Text>
      {menu.isLoading ? (
        <View>
          <ActivityIndicator accessibilityLabel="Loading menu" />
          <Text>Loading menu…</Text>
        </View>
      ) : menu.loadError ? (
        <View>
          <Text accessibilityRole="alert">{menu.loadError}</Text>
          <Button title="Retry" onPress={menu.retry} />
        </View>
      ) : menu.items.length === 0 ? (
        <Text>No menu items yet.</Text>
      ) : (
        menu.items.map((item) => (
          <View key={item.id}>
            <Text>{menu.categoryNames.get(item.categoryId) ?? 'Uncategorized'}</Text>
            <Text>{item.name}</Text>
            <Text>Price: {(item.priceCents / 100).toFixed(2)}</Text>
            <Switch
              accessibilityLabel={`Availability for ${item.name}`}
              value={item.isAvailable}
              disabled={menu.isUpdating}
              onValueChange={() => menu.toggleAvailability(item)}
            />
            <Text>{item.isAvailable ? 'Available' : 'Unavailable'}</Text>
          </View>
        ))
      )}
      {menu.isUpdating ? <Text accessibilityLiveRegion="polite">Updating availability…</Text> : null}
      {menu.updateError ? <Text accessibilityRole="alert">{menu.updateError}</Text> : null}
    </ScrollView>
  );
}
